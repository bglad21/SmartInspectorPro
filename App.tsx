/**
 * Smart Inspector Pro - Main App Component
 *
 * Entry point for the application.
 * Initializes all core services and providers.
 *
 * Created: Phase 2
 * Updated: Phase 8 - Added Navigation
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
// Import navigation
import RootNavigator from '@/navigation';
import { store } from '@/redux/store';
// Import services
import { initializeAmplify } from '@/services/amplify.service';
// Import providers
import { ThemeProvider } from '@/theme';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Initialize AWS Amplify on app startup
  useEffect(() => {
    initializeAmplify();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
