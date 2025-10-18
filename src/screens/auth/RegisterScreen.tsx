/**
 * RegisterScreen Component
 * 
 * Allows new users to create an account with business name, email, and password.
 * Integrates with Redux auth slice for state management.
 * 
 * Features:
 * - Complete registration form with validation
 * - Business name, email, password fields
 * - Loading states
 * - Error handling
 * - Navigation to email verification on success
 * 
 * @screen
 */

import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  signUp,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from '../../redux/slices/auth.slice';
import {
  ThemedView,
  ThemedText,
  Button,
  TextInput,
} from '../../components/common';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading('signUp'));
  const error = useAppSelector(selectAuthError);

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<{
    businessName?: string;
    email?: string;
    username?: string;
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
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
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
      const result = await dispatch(
        signUp({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          businessName: formData.businessName,
          membershipTier: 'professional', // Default tier
        })
      ).unwrap();

      if (result.needsEmailVerification) {
        // Navigate to email verification screen
        navigation.navigate('VerifyEmail', {
          username: formData.username,
          email: formData.email,
        });
      }
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Registration failed:', err);
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
            <ThemedText variant="body" color="secondary" style={styles.subtitle}>
              Start your professional inspection journey
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Business Name"
              value={formData.businessName}
              onChangeText={(text) => updateField('businessName', text)}
              error={errors.businessName}
              autoCapitalize="words"
              placeholder="Enter your business name"
              editable={!loading}
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="Enter your email"
              editable={!loading}
            />

            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) => updateField('username', text)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              placeholder="Choose a username"
              editable={!loading}
            />

            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              textContentType="newPassword"
              placeholder="Create a password"
              editable={!loading}
            />

            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
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
