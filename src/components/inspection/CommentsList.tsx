/**
 * CommentsList Component
 *
 * Displays pre-written comments with selection capability.
 * Used in inspection workflow to quickly select common comments.
 *
 * Features:
 * - List of selectable comments
 * - Single or multiple selection
 * - Custom comment option
 * - Theme-aware styling
 * - Search/filter capability
 *
 * @component
 */

import { Card, TextInput, ThemedText } from '@/components/common';
import { useTheme } from '@/theme';
import type React from 'react';
import { useState } from 'react';
import {
  FlatList,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';

export interface Comment {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Comment text
   */
  text: string;

  /**
   * Category (optional)
   */
  category?: string;
}

export interface CommentsListProps {
  /**
   * Array of available comments
   */
  comments: Comment[];

  /**
   * Selected comment IDs
   */
  selectedIds: string[];

  /**
   * Callback when comment selection changes
   */
  onSelectionChange: (selectedIds: string[]) => void;

  /**
   * Allow multiple selection
   * @default false
   */
  multiSelect?: boolean;

  /**
   * Enable search/filter
   * @default true
   */
  searchEnabled?: boolean;

  /**
   * Show add custom comment option
   * @default true
   */
  allowCustom?: boolean;

  /**
   * Callback when custom comment is added
   */
  onCustomCommentAdd?: (text: string) => void;

  /**
   * Custom style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;

  /**
   * Test ID
   */
  testID?: string;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  selectedIds,
  onSelectionChange,
  multiSelect = false,
  searchEnabled = true,
  allowCustom = true,
  onCustomCommentAdd,
  style,
  accessibilityLabel: _accessibilityLabel,
  testID,
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [customComment, setCustomComment] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const filteredComments = searchQuery
    ? comments.filter(comment =>
        comment.text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : comments;

  const handleSelect = (commentId: string) => {
    if (multiSelect) {
      const newSelection = selectedIds.includes(commentId)
        ? selectedIds.filter(id => id !== commentId)
        : [...selectedIds, commentId];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([commentId]);
    }
  };

  const handleAddCustom = () => {
    if (customComment.trim()) {
      onCustomCommentAdd?.(customComment.trim());
      setCustomComment('');
      setShowCustomInput(false);
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Search */}
      {searchEnabled && (
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search comments..."
          style={styles.searchInput}
        />
      )}

      {/* Comments List */}
      <FlatList
        data={filteredComments}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => handleSelect(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${
                isSelected ? 'Deselect' : 'Select'
              } comment: ${item.text}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Card
                elevation="small"
                padding="md"
                style={[
                  styles.commentCard,
                  isSelected && styles.selectedCard,
                  isSelected && {
                    backgroundColor: theme.colors.primaryLight,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                <View style={styles.commentContent}>
                  <View style={styles.commentTextContainer}>
                    {item.category && (
                      <ThemedText
                        variant="caption"
                        color="textSecondary"
                        style={styles.category}
                      >
                        {item.category}
                      </ThemedText>
                    )}
                    <ThemedText
                      variant="body1"
                      color={isSelected ? 'primary' : 'text'}
                    >
                      {item.text}
                    </ThemedText>
                  </View>
                  {isSelected && (
                    <ThemedText variant="h3" color="primary">
                      ✓
                    </ThemedText>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText variant="body2" color="textSecondary">
              No comments found
            </ThemedText>
          </View>
        }
        ListFooterComponent={
          allowCustom ? (
            <View style={styles.customSection}>
              {!showCustomInput ? (
                <TouchableOpacity
                  onPress={() => setShowCustomInput(true)}
                  accessibilityLabel="Add custom comment"
                  accessibilityRole="button"
                >
                  <Card elevation="small" padding="md" style={styles.addButton}>
                    <ThemedText variant="body1" color="primary">
                      + Add Custom Comment
                    </ThemedText>
                  </Card>
                </TouchableOpacity>
              ) : (
                <Card elevation="small" padding="md">
                  <TextInput
                    value={customComment}
                    onChangeText={setCustomComment}
                    placeholder="Enter custom comment..."
                    multiline
                    numberOfLines={3}
                    style={styles.customInput}
                    autoFocus
                  />
                  <View style={styles.customButtons}>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCustomInput(false);
                        setCustomComment('');
                      }}
                      style={styles.cancelButton}
                      accessibilityLabel="Cancel"
                      accessibilityRole="button"
                    >
                      <ThemedText variant="body2" color="textSecondary">
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddCustom}
                      style={styles.addButtonSmall}
                      disabled={!customComment.trim()}
                      accessibilityLabel="Add comment"
                      accessibilityRole="button"
                    >
                      <ThemedText
                        variant="body2"
                        color={
                          customComment.trim() ? 'primary' : 'textSecondary'
                        }
                      >
                        Add
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            </View>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  commentCard: {
    marginBottom: 8,
  },
  selectedCard: {
    borderWidth: 2,
  },
  commentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  category: {
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  customSection: {
    marginTop: 16,
  },
  addButton: {
    alignItems: 'center',
  },
  customInput: {
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  customButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  cancelButton: {
    padding: 8,
  },
  addButtonSmall: {
    padding: 8,
  },
});
