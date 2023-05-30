import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, MAX_CONTENT_WIDTH, spacing } from '../theme';

/**
 * Page chrome: a full-bleed backdrop with a capped, centred content column.
 * Without the cap the phone layout stretches edge to edge on a tablet and on
 * the web target, which leaves rows metres wide and unreadable.
 */
export default function Screen({ children, style, testID, centered = false }) {
  return (
    <View style={styles.backdrop}>
      <View style={[styles.column, centered && styles.centered, style]} testID={testID}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.background,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
  },
  centered: {
    justifyContent: 'center',
  },
});
