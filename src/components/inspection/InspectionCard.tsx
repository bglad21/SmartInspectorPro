/**
 * InspectionCard Component
 *
 * Displays a summary card for an inspection with status badge, address, and metadata.
 * Used in lists and overview screens to show inspection information.
 *
 * Features:
 * - Status badge with color coding
 * - Property address and client name
 * - Scheduled/completed dates
 * - Touch interaction for navigation
 * - Theme-aware styling
 *
 * @component
 */

import type React from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Card, Badge, ThemedText } from '@/components/common';
import type { Inspection } from '@/services/database.service';

export interface InspectionCardProps {
  /**
   * Inspection data to display
   */
  inspection: Inspection;

  /**
   * Callback when card is pressed
   */
  onPress?: (inspection: Inspection) => void;

  /**
   * Custom style for the card container
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Accessibility label for screen readers
   */
  accessibilityLabel?: string;

  /**
   * Test ID for testing
   */
  testID?: string;
}

/**
 * Maps inspection status to badge variant
 */
const getStatusVariant = (
  status: Inspection['status'],
): 'success' | 'warning' | 'error' | 'info' | 'primary' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'warning';
    case 'cancelled':
      return 'error';
    case 'scheduled':
      return 'info';
    default:
      return 'primary';
  }
};

/**
 * Formats status text for display
 */
const formatStatus = (status: Inspection['status']): string => {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    case 'scheduled':
      return 'Scheduled';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

/**
 * Formats date string for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const InspectionCard: React.FC<InspectionCardProps> = ({
  inspection,
  onPress,
  style,
  accessibilityLabel,
  testID,
}) => {
  const handlePress = () => {
    onPress?.(inspection);
  };

  const dateToShow = inspection.completedDate || inspection.scheduledDate;
  const dateLabel =
    inspection.status === 'completed' ? 'Completed' : 'Scheduled';

  return (
    <Card
      elevation="small"
      padding="md"
      onPress={handlePress}
      style={style}
      accessibilityLabel={
        accessibilityLabel ||
        `Inspection for ${inspection.propertyAddress}, status: ${inspection.status}`
      }
      testID={testID}
    >
      {/* Header: Address and Status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText variant="h4" numberOfLines={1} style={styles.address}>
            {inspection.propertyAddress}
          </ThemedText>
          <ThemedText
            variant="body2"
            color="textSecondary"
            style={styles.propertyType}
          >
            {inspection.propertyType
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
          </ThemedText>
        </View>
        <Badge
          label={formatStatus(inspection.status)}
          variant={getStatusVariant(inspection.status)}
          size="small"
        />
      </View>

      {/* Client Info */}
      {inspection.clientName && (
        <View style={styles.clientInfo}>
          <ThemedText variant="body2" color="textSecondary">
            Client:{' '}
          </ThemedText>
          <ThemedText variant="body2">{inspection.clientName}</ThemedText>
        </View>
      )}

      {/* Date Info */}
      <View style={styles.dateInfo}>
        <ThemedText variant="caption" color="textSecondary">
          {dateLabel}:{' '}
        </ThemedText>
        <ThemedText variant="caption">{formatDate(dateToShow)}</ThemedText>
      </View>

      {/* Notes Preview */}
      {inspection.notes && (
        <ThemedText
          variant="body2"
          color="textSecondary"
          numberOfLines={2}
          style={styles.notes}
        >
          {inspection.notes}
        </ThemedText>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  address: {
    marginBottom: 4,
  },
  propertyType: {
    fontSize: 12,
  },
  clientInfo: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  notes: {
    marginTop: 4,
    fontStyle: 'italic',
  },
});
