import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, elevation, spacing, typography } from '../theme';

export default function Card({ title, action, children, style, testID }) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {(title || action) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {action ?? null}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...elevation.card,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.overline,
    color: colors.textMuted,
  },
});
