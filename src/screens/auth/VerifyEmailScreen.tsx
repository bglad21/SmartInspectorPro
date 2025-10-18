/**
 * VerifyEmailScreen Component
 *
 * Allows users to verify their email address after registration.
 *
 * Features:
 * - Verification code input
 * - Code confirmation
 * - Resend code functionality
 * - Loading states
 * - Error handling
 * - Auto-navigation on success
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
  confirmSignUp,
  resendConfirmationCode,
  selectAuthError,
  selectAuthLoading,
} from '../../redux/slices/auth.slice';

interface VerifyEmailScreenProps {
  route: {
    params: {
      username: string;
      email: string;
    };
  };
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({
  route,
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const confirmLoading = useAppSelector(selectAuthLoading('confirmSignUp'));
  const error = useAppSelector(selectAuthError);

  const { username, email } = route.params;

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [resendLoading, setResendLoading] = useState(false);

  const loading = confirmLoading || resendLoading;

  // Show error alert when Redux error changes
  useEffect(() => {
    if (error) {
      Alert.alert('Verification Error', error.message, [
        {
          text: 'OK',
          onPress: () => dispatch(clearError()),
        },
      ]);
    }
  }, [error, dispatch]);

  /**
   * Validate verification code
   */
  const validateCode = (): boolean => {
    if (!code.trim()) {
      setCodeError('Verification code is required');
      return false;
    }

    if (code.length !== 6) {
      setCodeError('Code must be 6 digits');
      return false;
    }

    return true;
  };

  /**
   * Handle email verification
   */
  const handleVerifyEmail = async () => {
    if (!validateCode()) {
      return;
    }

    try {
      await dispatch(
        confirmSignUp({
          username,
          confirmationCode: code,
        }),
      ).unwrap();

      Alert.alert(
        'Email Verified',
        'Your email has been successfully verified. You can now sign in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      );
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Email verification failed:', err);
    }
  };

  /**
   * Handle resend code
   */
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await dispatch(resendConfirmationCode(username)).unwrap();

      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email address.',
        [{ text: 'OK' }],
      );
    } catch (err) {
      // Error handled by Redux state and useEffect
      console.error('Resend code failed:', err);
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * Navigate back
   */
  const handleGoBack = () => {
    Alert.alert(
      'Cancel Verification',
      'Are you sure you want to cancel email verification? You will need to verify your email later to access all features.',
      [
        { text: 'Continue Verification', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
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
              Verify Your Email
            </ThemedText>
            <ThemedText
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              We sent a verification code to
            </ThemedText>
            <ThemedText variant="body" color="primary" style={styles.email}>
              {email}
            </ThemedText>
            <ThemedText variant="caption" color="secondary" style={styles.hint}>
              Please check your inbox and enter the 6-digit code below
            </ThemedText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              label="Verification Code"
              value={code}
              onChangeText={text => {
                setCode(text);
                if (codeError) {
                  setCodeError(undefined);
                }
              }}
              error={codeError}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit code"
              editable={!loading}
              autoFocus
            />

            <Button
              title="Verify Email"
              onPress={handleVerifyEmail}
              loading={confirmLoading}
              fullWidth
              style={styles.verifyButton}
            />

            <Button
              title="Resend Code"
              variant="secondary"
              onPress={handleResendCode}
              loading={resendLoading}
              disabled={confirmLoading}
              fullWidth
              style={styles.resendButton}
            />

            <Button
              title="Back"
              variant="text"
              onPress={handleGoBack}
              disabled={loading}
              fullWidth
            />
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <ThemedText
              variant="caption"
              color="secondary"
              style={styles.instructionText}
            >
              Didn't receive the code? Check your spam folder or use the "Resend
              Code" button above.
            </ThemedText>
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
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  email: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  verifyButton: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 12,
  },
  instructions: {
    paddingHorizontal: 16,
  },
  instructionText: {
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VerifyEmailScreen;
