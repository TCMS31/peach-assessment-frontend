import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { refresh, useCategories } from '../../state/apiState';
import { useReviewTransaction } from '../../state/useReviewTransaction';
import CategoryIcon from '../../ui/components/CategoryIcon';
import Screen from '../../ui/components/Screen';
import { EmptyState, ErrorState, LoadingState } from '../../ui/components/StateView';
import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../../ui/theme';

/**
 * Category grid, driven entirely by GET /categories. The original screen
 * hardcoded six tiles, five of which only wrote a debug string to the console,
 * and used a label ("Subscription") the backend does not have.
 */
export default function CategoryPickerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId } = route.params ?? {};
  const { categories, status, error } = useCategories();
  const { submit, status: saveStatus, error: saveError, reset } = useReviewTransaction();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (saveStatus === 'done') {
      reset();
      navigation.goBack();
    }
  }, [saveStatus, reset, navigation]);

  const choose = useCallback(
    (category) => {
      setSelected(category.name);
      submit(transactionId, { category: { name: category.name, emoji: category.emoji } });
    },
    [submit, transactionId],
  );

  if (status === 'loading') {
    return (
      <Screen centered>
        <LoadingState label="Loading categories" />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen centered>
        <ErrorState title="Could not load categories" body={error ?? undefined} onRetry={refresh} />
      </Screen>
    );
  }

  if (categories.length === 0) {
    return (
      <Screen centered>
        <EmptyState title="No categories configured" body="Seed the backend to populate them." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} testID="category-picker">
        <Text style={styles.heading}>Choose a category</Text>
        {saveError ? (
          <Text style={styles.error} testID="category-picker-error">
            {saveError}
          </Text>
        ) : null}
        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.id ?? category.name}
              accessibilityRole="button"
              accessibilityLabel={category.name}
              accessibilityState={{ selected: selected === category.name }}
              testID={`category-tile-${category.name}`}
              onPress={() => choose(category)}
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: category.color ?? colors.surface },
                selected === category.name && styles.tileSelected,
                pressed && styles.tilePressed,
              ]}
            >
              <CategoryIcon category={category} size={44} />
              <Text numberOfLines={2} style={styles.tileLabel}>
                {category.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  heading: {
    ...typography.sectionTitle,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: 104,
    minHeight: MIN_TOUCH_TARGET * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tileSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  tilePressed: {
    opacity: 0.75,
  },
  tileLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  error: {
    ...typography.caption,
    color: colors.negative,
    marginBottom: spacing.md,
  },
});
