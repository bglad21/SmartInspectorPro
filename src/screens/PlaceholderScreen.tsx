/**
 * Placeholder Screen Component
 *
 * Temporary screen used during navigation setup.
 * Displays the screen name and a message that the screen is under construction.
 *
 * Created: Phase 8, Task P8-T01
 *
 * Features:
 * - Theme-aware styling
 * - Displays screen name from route
 * - Simple centered layout
 *
 * TODO: Replace with actual screen implementations in subsequent phases
 */

import { ThemedText } from '@/components/common/ThemedText';
import { ThemedView } from '@/components/common/ThemedView';
import type { MainStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = NativeStackScreenProps<
  MainStackParamList,
  keyof MainStackParamList
>;

interface PlaceholderScreenProps extends Partial<Props> {
  /**
   * Screen name to display
   * If not provided, will attempt to get from route.name
   */
  screenName?: string;
}

/**
 * Placeholder screen component shown during development
 * Displays a simple message indicating the screen is under construction
 *
 * @param screenName - Name of the screen to display (optional, defaults to route name)
 * @param route - Navigation route object (optional)
 * @returns Placeholder screen component
 */
export const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({
  screenName,
  route,
}) => {
  const { theme } = useTheme();
  const displayName = screenName || route?.name || 'Screen';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText variant="h3" style={styles.title}>
          {displayName}
        </ThemedText>
        <ThemedText
          variant="body1"
          style={[styles.message, { color: theme.colors.textSecondary }]}
        >
          This screen is under construction
        </ThemedText>
        <ThemedText
          variant="caption"
          style={[styles.phase, { color: theme.colors.textSecondary }]}
        >
          Will be implemented in Phase 9+
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 8,
    textAlign: 'center',
  },
  phase: {
    textAlign: 'center',
  },
});

export default PlaceholderScreen;
