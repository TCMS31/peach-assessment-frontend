import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../theme';

/**
 * Call to action for the review queue. The count is derived from the data; the
 * original hardcoded "10 New Transactions to Review" regardless of the backend.
 */
export default function ReviewBanner({ count, onPress }) {
  const plural = count === 1 ? 'transaction' : 'transactions';
  const label = count === 0 ? 'All transactions reviewed' : `${count} new ${plural} to review`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: count === 0 }}
      testID="review-banner"
      disabled={count === 0}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {count > 0 ? <Text style={styles.chevron}>→</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  gradient: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  chevron: {
    ...typography.title,
    color: colors.textPrimary,
  },
});
