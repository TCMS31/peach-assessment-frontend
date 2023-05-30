import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { getCategoryIcon } from '../../domain/categoryIcons';
import { colors, radii } from '../theme';

/**
 * Renders whatever the icon registry can offer for a category, degrading from
 * bundled artwork to the API's emoji to a lettered chip. It never renders blank.
 */
export default function CategoryIcon({ category, size = 40, testID }) {
  const icon = getCategoryIcon(category);
  const dimension = { width: size, height: size, borderRadius: radii.pill };
  const label = category?.name ?? 'Uncategorised';

  if (icon.kind === 'image') {
    return (
      <Image
        accessible
        accessibilityLabel={label}
        testID={testID}
        source={icon.source}
        resizeMode="contain"
        style={[styles.image, dimension]}
      />
    );
  }

  return (
    <View
      accessible
      accessibilityLabel={label}
      testID={testID}
      style={[styles.fallback, dimension, { backgroundColor: category?.color ?? colors.skeleton }]}
    >
      <Text style={[styles.fallbackText, { fontSize: size * 0.45 }]}>
        {icon.kind === 'emoji' ? icon.emoji : icon.initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surface,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: colors.textPrimary,
  },
});
