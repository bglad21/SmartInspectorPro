/**
 * LoginScreen Component
 *
 * Allows users to sign in with email and password.
 * Integrates with Redux auth slice for state management.
 *
 * Features:
 * - Email/password form validation
 * - Loading states
 * - Error handling
 * - Navigation to register and forgot password
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
  signIn,
} from '../../redux/slices/auth.slice';

interface LoginScreenProps {
  navigation: any; // TODO: Type with NavigationProp when navigation is set up
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading('signIn'));
  const error = useAppSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  // Show error alert when Redux error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error.message, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle sign in
   */
  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(signIn({ username, password })).unwrap();
      // Navigation will be handled by root navigator based on isAuthenticated
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Sign in failed:', err);
    }
  };

  /**
   * Navigate to register screen
   */
  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  /**
   * Navigate to forgot password screen
   */
  const handleNavigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
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
              Smart Inspector Pro
            </ThemedText>
            <ThemedText
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              Sign in to continue
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Username"
              value={username}
              onChangeText={text => {
                setUsername(text);
                if (errors.username) {
                  setErrors(prev => ({ ...prev, username: undefined }));
                }
              }}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              placeholder="Enter your username"
              editable={!loading}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              error={errors.password}
              secureTextEntry
              showPasswordToggle
              textContentType="password"
              placeholder="Enter your password"
              editable={!loading}
            />

            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              fullWidth
              style={styles.signInButton}
            />

            <Button
              title="Forgot Password?"
              variant="text"
              onPress={handleNavigateToForgotPassword}
              disabled={loading}
              fullWidth
            />
          </View>

          {/* Register Link */}
          <View style={styles.footer}>
            <ThemedText variant="body" color="secondary">
              Don't have an account?{' '}
            </ThemedText>
            <Button
              title="Sign Up"
              variant="text"
              onPress={handleNavigateToRegister}
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
    marginBottom: 48,
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
  signInButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
