/**
 * Auth Stack Navigator
 *
 * Navigation stack for authentication flow.
 * Contains Login, Register, ForgotPassword, and VerifyEmail screens.
 *
 * Created: Phase 8, Task P8-T01
 *
 * Features:
 * - Theme-aware header styling
 * - Type-safe navigation with AuthStackParamList
 * - No header on login (custom UI)
 * - Back navigation on other screens
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type React from 'react';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import { useTheme } from '../theme';
import type { AuthStackParamList } from './types';

// Wrapper for VerifyEmailScreen to bridge legacy props to new navigation props
// TODO: Remove this wrapper once VerifyEmailScreen is updated to use NativeStackScreenProps
const VerifyEmailScreenWrapper = ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>) => {
  // Convert new navigation props to legacy format expected by VerifyEmailScreen
  const legacyProps = {
    route: {
      params: {
        username: route.params.username,
        email: route.params.email,
      },
    },
    navigation: {
      navigate: (screen: string) => {
        // @ts-expect-error - Legacy navigation expects string, new navigation is typed
        navigation.navigate(screen);
      },
      goBack: () => navigation.goBack(),
    },
  };

  // Temporary bridge between legacy and new props
  return <VerifyEmailScreen {...legacyProps} />;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Stack Navigator Component
 *
 * @example
 * ```tsx
 * <NavigationContainer>
 *   <AuthStack />
 * </NavigationContainer>
 * ```
 */
export const AuthStack: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        // Theme-aware header styling
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        // Animation
        animation: 'slide_from_right',
        // Presentation
        presentation: 'card',
      }}
    >
      {/* Login Screen - No header (custom UI) */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
          // Disable swipe back on login
          gestureEnabled: false,
        }}
      />

      {/* Register Screen */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />

      {/* Forgot Password Screen */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />

      {/* Verify Email Screen */}
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreenWrapper}
        options={{
          title: 'Verify Email',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
