import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCurrency } from '../../domain/money';
import { formatTransactionDate } from '../../domain/transactions';
import { useReviewTransaction, useTransaction } from '../../state/useReviewTransaction';
import CategoryIcon from '../../ui/components/CategoryIcon';
import PrimaryButton from '../../ui/components/PrimaryButton';
import Screen from '../../ui/components/Screen';
import { EmptyState } from '../../ui/components/StateView';
import { colors, radii, spacing, typography } from '../../ui/theme';

/**
 * Review one transaction: confirm or change its category, then mark it
 * reviewed. Presented as a modal to match the original design intent, but as a
 * real route rather than a `<Modal>` duplicated into two screens.
 */
export default function ReviewTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactionId } = route.params ?? {};
  const transaction = useTransaction(transactionId);
  const { submit, isSaving, status, error, reset } = useReviewTransaction();

  useEffect(() => {
    if (status === 'done') {
      reset();
      navigation.goBack();
    }
  }, [status, reset, navigation]);

  const chooseCategory = useCallback(() => {
    navigation.navigate('CategoryPicker', { transactionId });
  }, [navigation, transactionId]);

  const markReviewed = useCallback(() => {
    submit(transactionId, { reviewed: true });
  }, [submit, transactionId]);

  if (transaction === null) {
    return (
      <Screen centered testID="review-screen">
        <EmptyState
          title="Transaction not available"
          body="It may have been reviewed on another device. Pull to refresh on the home screen."
        />
      </Screen>
    );
  }

  return (
    <Screen centered testID="review-screen">
      <View style={styles.card}>
        <Text style={styles.date}>{formatTransactionDate(transaction.date)}</Text>
        <Text style={styles.name}>{transaction.name}</Text>
        <Text style={styles.merchant}>{transaction.merchant.name}</Text>
        <Text style={styles.amount} testID="review-amount">
          {formatCurrency(transaction.amount)}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Category: ${transaction.category?.name ?? 'none'}. Tap to change.`}
          testID="review-category"
          onPress={chooseCategory}
          style={({ pressed }) => [styles.categoryChip, pressed && styles.pressed]}
        >
          <CategoryIcon category={transaction.category} size={28} />
          <Text style={styles.categoryName}>
            {transaction.category?.name ?? 'Choose a category'}
          </Text>
          <Text style={styles.change}>Change</Text>
        </Pressable>

        {error ? (
          <Text style={styles.error} testID="review-error">
            {error}
          </Text>
        ) : null}

        <PrimaryButton
          label="Mark as reviewed"
          testID="review-submit"
          busy={isSaving}
          onPress={markReviewed}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
    alignItems: 'stretch',
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
  name: {
    ...typography.title,
  },
  merchant: {
    ...typography.caption,
  },
  amount: {
    ...typography.display,
    marginVertical: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  pressed: {
    backgroundColor: colors.skeleton,
  },
  categoryName: {
    ...typography.bodyStrong,
    flex: 1,
  },
  change: {
    ...typography.caption,
    color: colors.focusRing,
  },
  error: {
    ...typography.caption,
    color: colors.negative,
    marginBottom: spacing.sm,
  },
});
