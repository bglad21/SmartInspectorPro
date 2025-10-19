/**
 * Common Components
 *
 * Export all common UI components
 * Enhanced in P6-T02 with full theme system integration
 */

// Button
export { Button } from './Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  ButtonColor,
} from './Button';

// TextInput
export { TextInput } from './TextInput';
export type { TextInputProps } from './TextInput';

// ThemedText
export { ThemedText } from './ThemedText';
export type { TextColor, TextVariant, ThemedTextProps } from './ThemedText';

// ThemedView
export { ThemedView } from './ThemedView';
export type { ThemedViewProps } from './ThemedView';

// Card
export { Card } from './Card';
export type { CardProps, CardElevation, CardPadding } from './Card';

// Badge
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge';

// Modal
export { Modal } from './Modal';
export type { ModalProps, ModalSize, ModalAnimation } from './Modal';

// LoadingSpinner
export { LoadingSpinner } from './LoadingSpinner';
export type {
  LoadingSpinnerProps,
  LoadingSpinnerSize,
  LoadingSpinnerColor,
} from './LoadingSpinner';

// EmptyState
export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';
