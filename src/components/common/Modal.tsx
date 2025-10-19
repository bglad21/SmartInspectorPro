/**
 * Modal Component
 *
 * A themed modal overlay component with customizable size and animations.
 * Created in P6-T02 as part of themed UI components.
 *
 * @component
 * @example
 * ```tsx
 * <Modal
 *   visible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   title="Confirm Action"
 *   size="medium"
 * >
 *   <ThemedText>Are you sure you want to continue?</ThemedText>
 *   <Button title="Confirm" onPress={handleConfirm} />
 * </Modal>
 * ```
 */

import type React from 'react';
import {
  Modal as RNModal,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  type ModalProps as RNModalProps,
} from 'react-native';
import { useTheme } from '@/theme';
import ThemedText from './ThemedText';

export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';
export type ModalAnimation = 'slide' | 'fade' | 'none';

export interface ModalProps extends Omit<RNModalProps, 'children'> {
  /**
   * Modal visibility
   */
  visible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Modal title (optional)
   */
  title?: string;

  /**
   * Modal content
   */
  children: React.ReactNode;

  /**
   * Modal size
   * @default 'medium'
   */
  size?: ModalSize;

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Animation type
   * @default 'slide'
   */
  animationType?: ModalAnimation;

  /**
   * Allow close on overlay tap
   * @default true
   */
  closeOnOverlayTap?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  animationType = 'slide',
  closeOnOverlayTap = true,
  testID = 'modal',
  ...props
}) => {
  const { theme } = useTheme();

  const isFullscreen = size === 'fullscreen';

  // Get modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case 'small':
        return '80%';
      case 'large':
        return '95%';
      case 'fullscreen':
        return '100%';
      case 'medium':
      default:
        return '90%';
    }
  };

  // Get max width based on size
  const getMaxWidth = () => {
    switch (size) {
      case 'small':
        return 400;
      case 'large':
        return 900;
      case 'fullscreen':
        return undefined;
      case 'medium':
      default:
        return 600;
    }
  };

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={!isFullscreen}
      onRequestClose={onClose}
      testID={testID}
      statusBarTranslucent
      {...props}
    >
      <View
        style={[
          styles.overlay,
          isFullscreen && styles.fullscreenOverlay,
          { backgroundColor: isFullscreen ? theme.colors.background : theme.colors.overlay },
        ]}
      >
        {closeOnOverlayTap && !isFullscreen && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            testID={`${testID}-overlay`}
          />
        )}

        <View
          style={[
            styles.content,
            isFullscreen && styles.fullscreenContent,
            {
              backgroundColor: theme.colors.surface,
              width: getModalWidth(),
              maxWidth: getMaxWidth(),
            },
            !isFullscreen && {
              borderRadius: theme.borderRadius.lg,
              ...theme.shadows.large,
            },
          ]}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View
              style={[
                styles.header,
                {
                  borderBottomColor: theme.colors.border,
                  paddingHorizontal: theme.spacing.lg,
                  paddingVertical: theme.spacing.md,
                },
                title && styles.headerWithBorder,
              ]}
            >
              {title && (
                <ThemedText variant="h3" style={styles.title}>
                  {title}
                </ThemedText>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  testID={`${testID}-close`}
                >
                  <ThemedText
                    style={[styles.closeText, { color: theme.colors.textSecondary }]}
                  >
                    ×
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Body */}
          <ScrollView
            style={[
              styles.body,
              {
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.md,
              },
            ]}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullscreenOverlay: {
    padding: 0,
  },
  content: {
    maxHeight: '90%',
    overflow: 'hidden',
  },
  fullscreenContent: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerWithBorder: {
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 24,
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    flexGrow: 1,
  },
});

export default Modal;
