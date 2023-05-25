import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CategoryIcon from './CategoryIcon';
import { formatCurrency } from '../../domain/money';
import { formatTransactionDate, INCOME_CATEGORY } from '../../domain/transactions';
import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../theme';

export const ROW_HEIGHT = 68;

export default function TransactionRow({ transaction, onPress }) {
  const isIncome = transaction.category?.name === INCOME_CATEGORY;
  const accent = transaction.reviewed ? colors.positive : colors.gradientStart;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${transaction.name}, ${formatCurrency(transaction.amount)}, ${
        transaction.reviewed ? 'reviewed' : 'needs review'
      }`}
      testID={`transaction-row-${transaction.id}`}
      onPress={onPress ? () => onPress(transaction) : undefined}
      style={({ pressed }) => [styles.row, { borderLeftColor: accent }, pressed && styles.pressed]}
    >
      <CategoryIcon category={transaction.category} size={36} />
      <View style={styles.details}>
        <Text numberOfLines={1} style={styles.name}>
          {transaction.name}
        </Text>
        <Text numberOfLines={1} style={styles.merchant}>
          {transaction.merchant.name}
        </Text>
      </View>
      <View style={styles.amountColumn}>
        <Text style={[styles.amount, isIncome && styles.amountIncome]}>
          {isIncome
            ? formatCurrency(transaction.amount, { signed: true })
            : formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.date}>{formatTransactionDate(transaction.date)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    minHeight: MIN_TOUCH_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.skeleton,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
  },
  merchant: {
    ...typography.caption,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    ...typography.bodyStrong,
  },
  amountIncome: {
    color: colors.positive,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
