/**
 * TextInput Component
 *
 * A themed text input component with label, error message, and icons.
 * This is a minimal implementation to unblock P4-T03.
 * Full input system will be enhanced in P6-T02.
 *
 * @component
 * @example
 * ```tsx
 * <TextInput
 *   label="Email"
 *   value={email}
 *   onChangeText={setEmail}
 *   error={emailError}
 *   keyboardType="email-address"
 * />
 * ```
 */

import { useState } from 'react';
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import ThemedText from './ThemedText';

export interface TextInputProps extends RNTextInputProps {
  /**
   * Input label
   */
  label?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Show password toggle for secure text entry
   */
  showPasswordToggle?: boolean;
}

/**
 * Temporary theme colors until P6-T01 theme system is implemented
 */
const COLORS = {
  light: {
    text: '#000000',
    placeholder: '#999999',
    border: '#CCCCCC',
    borderFocus: '#2E5BBA',
    borderError: '#F44336',
    background: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    placeholder: '#666666',
    border: '#444444',
    borderFocus: '#5C8BFF',
    borderError: '#FF6B6B',
    background: '#1E1E1E',
  },
};

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  showPasswordToggle,
  secureTextEntry,
  style,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? COLORS.dark : COLORS.light;

  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? theme.borderError
    : isFocused
    ? theme.borderFocus
    : theme.border;

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText variant="caption" style={styles.label}>
          {label}
        </ThemedText>
      )}
      <View style={styles.inputContainer}>
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.background,
              borderColor,
            },
            style,
          ]}
          placeholderTextColor={theme.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={
            showPasswordToggle ? !isPasswordVisible : secureTextEntry
          }
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <ThemedText variant="caption" color="primary">
              {isPasswordVisible ? 'Hide' : 'Show'}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <ThemedText variant="caption" color="error" style={styles.error}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  error: {
    marginTop: 4,
  },
});

export default TextInput;
