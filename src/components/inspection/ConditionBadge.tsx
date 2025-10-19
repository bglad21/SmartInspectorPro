/**
 * ConditionBadge Component
 *
 * Color-coded badge for the 5 inspection condition types.
 * Wrapper around Badge component with condition-specific variants.
 *
 * Features:
 * - 5 condition types with specific colors
 * - Consistent sizing and styling
 * - Theme-aware colors
 *
 * @component
 */

import { Badge, type BadgeSize } from '@/components/common';
import type { InspectionRecord } from '@/services/database.service';
import type React from 'react';

export type ConditionType = InspectionRecord['condition'];

export interface ConditionBadgeProps {
  /**
   * Condition type
   */
  condition: ConditionType;

  /**
   * Badge size
   * @default 'medium'
   */
  size?: BadgeSize;

  /**
   * Show as dot only
   * @default false
   */
  dot?: boolean;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID
   */
  testID?: string;
}

/**
 * Maps condition types to badge variants
 */
const getConditionVariant = (
  condition: ConditionType,
):
  | 'acceptable'
  | 'monitor'
  | 'repair'
  | 'safetyHazard'
  | 'accessRestricted' => {
  switch (condition) {
    case 'Acceptable':
      return 'acceptable';
    case 'Monitor':
      return 'monitor';
    case 'Repair/Replace':
      return 'repair';
    case 'Safety Hazard':
      return 'safetyHazard';
    case 'Access Restricted':
      return 'accessRestricted';
  }
};

/**
 * ConditionBadge component
 */
export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  condition,
  size = 'medium',
  dot = false,
  accessibilityLabel,
  testID,
}) => {
  // Note: Badge component doesn't have dot prop yet, using label for now
  return (
    <Badge
      label={dot ? '' : condition}
      variant={getConditionVariant(condition)}
      size={size}
      accessibilityLabel={accessibilityLabel || `Condition: ${condition}`}
      testID={testID}
    />
  );
};
