import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, MIN_TOUCH_TARGET, radii, spacing, typography } from '../theme';

/**
 * One component for the three states every data screen needs. Having them in a
 * single place is why loading, empty and error all look like the same app.
 */
export function LoadingState({ label = 'Loading', testID = 'state-loading' }) {
  return (
    <View style={styles.container} testID={testID}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, body, testID = 'state-empty' }) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  body,
  onRetry,
  testID = 'state-error',
}) {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          testID="state-error-retry"
          style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    textAlign: 'center',
  },
  body: {
    ...typography.caption,
    textAlign: 'center',
  },
  retry: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
  },
  retryPressed: {
    opacity: 0.8,
  },
  retryText: {
    ...typography.bodyStrong,
    color: colors.textInverse,
  },
});
