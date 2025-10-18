/**
 * ForgotPasswordScreen Component
 * 
 * Allows users to reset their password via email verification.
 * Two-step process:
 * 1. Request reset code (send to email)
 * 2. Confirm with code and new password
 * 
 * Features:
 * - Email/username input
 * - Verification code input
 * - New password input
 * - Loading states
 * - Error handling
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
  forgotPassword,
  confirmForgotPassword,
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

interface ForgotPasswordScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string) => void;
  };
}

type Step = 'request' | 'confirm';

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const forgotLoading = useAppSelector(selectAuthLoading('forgotPassword'));
  const confirmLoading = useAppSelector(selectAuthLoading('confirmForgotPassword'));
  const error = useAppSelector(selectAuthError);

  const [step, setStep] = useState<Step>('request');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    username?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const loading = forgotLoading || confirmLoading;

  // Show error alert when Redux error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Password Reset Error', error.message, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  /**
   * Validate password strength
   */
  const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * Validate request step
   */
  const validateRequestStep = (): boolean => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate confirm step
   */
  const validateConfirmStep = (): boolean => {
    const newErrors: typeof errors = {};

    if (!code.trim()) {
      newErrors.code = 'Verification code is required';
    } else if (code.length !== 6) {
      newErrors.code = 'Code must be 6 digits';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!isValidPassword(newPassword)) {
      newErrors.newPassword =
        'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle request reset code
   */
  const handleRequestCode = async () => {
    if (!validateRequestStep()) {
      return;
    }

    try {
      await dispatch(forgotPassword({ username })).unwrap();
      
      Alert.alert(
        'Code Sent',
        'A verification code has been sent to your email address.',
        [{ text: 'OK' }]
      );
      
      setStep('confirm');
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Request code failed:', err);
    }
  };

  /**
   * Handle confirm password reset
   */
  const handleConfirmReset = async () => {
    if (!validateConfirmStep()) {
      return;
    }

    try {
      await dispatch(
        confirmForgotPassword({
          username,
          confirmationCode: code,
          newPassword,
        })
      ).unwrap();

      Alert.alert(
        'Password Reset',
        'Your password has been successfully reset. You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Confirm reset failed:', err);
    }
  };

  /**
   * Navigate back to login
   */
  const handleBackToLogin = () => {
    navigation.goBack();
  };

  /**
   * Render request code step
   */
  const renderRequestStep = () => (
    <>
      <View style={styles.header}>
        <ThemedText variant="h1" style={styles.title}>
          Forgot Password
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.subtitle}>
          Enter your username to receive a verification code
        </ThemedText>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Username"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            if (errors.username) {
              setErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          error={errors.username}
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="username"
          placeholder="Enter your username"
          editable={!loading}
        />

        <Button
          title="Send Code"
          onPress={handleRequestCode}
          loading={forgotLoading}
          fullWidth
          style={styles.primaryButton}
        />

        <Button
          title="Back to Login"
          variant="text"
          onPress={handleBackToLogin}
          disabled={loading}
          fullWidth
        />
      </View>
    </>
  );

  /**
   * Render confirm reset step
   */
  const renderConfirmStep = () => (
    <>
      <View style={styles.header}>
        <ThemedText variant="h1" style={styles.title}>
          Reset Password
        </ThemedText>
        <ThemedText variant="body" color="secondary" style={styles.subtitle}>
          Enter the code from your email and your new password
        </ThemedText>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Verification Code"
          value={code}
          onChangeText={(text) => {
            setCode(text);
            if (errors.code) {
              setErrors((prev) => ({ ...prev, code: undefined }));
            }
          }}
          error={errors.code}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="Enter 6-digit code"
          editable={!loading}
        />

        <TextInput
          label="New Password"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            if (errors.newPassword) {
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }
          }}
          error={errors.newPassword}
          secureTextEntry
          showPasswordToggle
          textContentType="newPassword"
          placeholder="Enter new password"
          editable={!loading}
        />

        <TextInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) {
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          error={errors.confirmPassword}
          secureTextEntry
          showPasswordToggle
          textContentType="newPassword"
          placeholder="Confirm new password"
          editable={!loading}
        />

        <Button
          title="Reset Password"
          onPress={handleConfirmReset}
          loading={confirmLoading}
          fullWidth
          style={styles.primaryButton}
        />

        <Button
          title="Resend Code"
          variant="text"
          onPress={handleRequestCode}
          disabled={loading}
          fullWidth
        />
      </View>
    </>
  );

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
          {step === 'request' ? renderRequestStep() : renderConfirmStep()}
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
  primaryButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default ForgotPasswordScreen;
