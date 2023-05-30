import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Card from './Card';
import DonutChart from './DonutChart';
import { EmptyState } from './StateView';
import { formatCurrency, formatPercentage } from '../../domain/money';
import { colors, spacing, typography } from '../theme';

export default function SpendingSummary({ categories, total }) {
  if (categories.length === 0) {
    return (
      <Card title="Top spending categories" testID="spending-summary">
        <EmptyState
          title="Nothing to chart yet"
          body="Spending appears here once transactions are categorised."
        />
      </Card>
    );
  }

  return (
    <Card title="Top spending categories" testID="spending-summary">
      <View style={styles.body}>
        <View style={styles.legend}>
          {categories.map((category) => (
            <View
              key={category.name}
              style={[styles.legendItem, { borderLeftColor: category.color }]}
            >
              <Text numberOfLines={1} style={styles.legendName}>
                {category.name}
              </Text>
              <Text style={styles.legendAmount}>{formatCurrency(category.total)}</Text>
              <Text style={styles.legendShare}>{formatPercentage(category.share)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartColumn}>
          <View style={styles.chartStack}>
            <DonutChart slices={categories} />
            <View style={styles.chartCenter} pointerEvents="none">
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue} testID="spending-total">
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendItem: {
    borderLeftWidth: 3,
    paddingLeft: spacing.sm,
  },
  legendName: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  legendAmount: {
    ...typography.bodyStrong,
  },
  legendShare: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chartColumn: {
    alignItems: 'center',
  },
  chartStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    ...typography.overline,
  },
  totalValue: {
    ...typography.title,
  },
});
