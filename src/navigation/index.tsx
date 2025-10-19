/**
 * Root Navigation
 *
 * Main navigation entry point for the application.
 * Handles conditional rendering of Auth vs Main stack based on authentication state.
 *
 * Created: Phase 8, Task P8-T01
 *
 * Features:
 * - NavigationContainer with theme integration
 * - Conditional stack rendering (Auth vs Main)
 * - Loading state while checking authentication
 * - Deep linking configuration (reserved for future)
 * - CSV data loading on first app launch
 *
 * Navigation Flow:
 * 1. App loads → Check authentication state
 * 2. If not authenticated → Show AuthStack (Login, Register, etc.)
 * 3. If authenticated → Load CSV data → Show MainStack (Home, etc.)
 */

import type React from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../theme';
import { useAppSelector } from '../redux/hooks';
import { ThemedText } from '@/components/common/ThemedText';
import type { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 * Provides top-level navigation structure with authentication flow
 *
 * @returns Root navigation container
 */
export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // TODO: Implement CSV data loading on first authenticated session
  // This will be added in Phase 5 when data layer is implemented
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAuthenticated) {
        try {
          setIsLoadingData(true);
          // TODO: Load CSV data from AsyncStorage or fetch from API
          // await loadCSVData();
        } catch (error) {
          console.error('Failed to load initial data:', error);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    loadInitialData();
  }, [isAuthenticated]);

  // Show loading spinner while checking authentication or loading data
  if (!isInitialized || isLoadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText variant="body1" style={styles.loadingText}>
          {isLoadingData ? 'Loading inspection data...' : 'Loading...'}
        </ThemedText>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
      // Deep linking configuration (reserved for future Phase 14+)
      // linking={{
      //   prefixes: ['smartinspector://', 'https://smartinspector.app'],
      //   config: {
      //     screens: {
      //       Auth: {
      //         screens: {
      //           Login: 'login',
      //           Register: 'register',
      //         },
      //       },
      //       Main: {
      //         screens: {
      //           Home: 'home',
      //           // ... other deep links
      //         },
      //       },
      //     },
      //   },
      // }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
});

export default RootNavigator;
