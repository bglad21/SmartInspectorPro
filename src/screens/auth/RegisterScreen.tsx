/**
 * RegisterScreen Component
 *
 * Allows new users to create an account with first name, last name, email, and password.
 * Integrates with Redux auth slice for state management.
 *
 * Features:
 * - Complete registration form with validation
 * - First name, last name, email, password fields
 * - Loading states
 * - Error handling
 * - Navigation to email verification on success
 *
 * @screen
 */

import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  TextInput,
  ThemedText,
  ThemedView,
} from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  clearError,
  selectAuthError,
  selectAuthLoading,
  signUp,
} from '../../redux/slices/auth.slice';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading('signUp'));
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Show error alert when Redux error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Registration Error', error.message, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  /**
   * Update form field
   */
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Validate password strength
   */
  const isValidPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle registration
   */
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('🔵 Starting registration for:', formData.email);
      console.log('🔵 Registration data:', {
        username: formData.email, // Using email as username
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        passwordLength: formData.password.length,
      });

      const result = await dispatch(
        signUp({
          username: formData.email, // Use email as username
          password: formData.password,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          membershipTier: 'professional', // Default tier
        }),
      ).unwrap();

      console.log('✅ Registration successful:', result);

      if (result.needsEmailVerification) {
        // Navigate to email verification screen
        navigation.navigate('VerifyEmail', {
          username: formData.email, // Pass email as username
          email: formData.email,
          password: formData.password, // Pass password for auto sign-in after verification
        });
      }
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error(
        '❌ Registration failed - Full error:',
        JSON.stringify(err, null, 2),
      );
      console.error('❌ Registration failed - Error object:', err);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="h1" style={styles.title}>
              Create Account
            </ThemedText>
            <ThemedText
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              Start your professional inspection journey
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={text => updateField('firstName', text)}
              error={errors.firstName}
              autoCapitalize="words"
              textContentType="givenName"
              placeholder="Enter your first name"
              editable={!loading}
            />

            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={text => updateField('lastName', text)}
              error={errors.lastName}
              autoCapitalize="words"
              textContentType="familyName"
              placeholder="Enter your last name"
              editable={!loading}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              error={errors.email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="Enter your email"
              editable={!loading}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={text => updateField('password', text)}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
              placeholder="Create a password"
              editable={!loading}
            />

            {/* Password Requirements */}
            <View style={styles.passwordHints}>
              <ThemedText variant="caption" color="secondary">
                Password must contain:
              </ThemedText>
              <ThemedText
                variant="caption"
                color="secondary"
                style={styles.passwordHint}
              >
                • At least 8 characters
              </ThemedText>
              <ThemedText
                variant="caption"
                color="secondary"
                style={styles.passwordHint}
              >
                • Uppercase and lowercase letters
              </ThemedText>
              <ThemedText
                variant="caption"
                color="secondary"
                style={styles.passwordHint}
              >
                • At least one number
              </ThemedText>
              <ThemedText
                variant="caption"
                color="secondary"
                style={styles.passwordHint}
              >
                • At least one special character (!@#$%^&*)
              </ThemedText>
            </View>

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={text => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
              placeholder="Confirm your password"
              editable={!loading}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              style={styles.registerButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <ThemedText variant="body" color="secondary">
              Already have an account?{' '}
            </ThemedText>
            <Button
              title="Sign In"
              variant="text"
              onPress={handleBackToLogin}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  passwordHints: {
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 8,
  },
  passwordHint: {
    marginTop: 2,
  },
  registerButton: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
