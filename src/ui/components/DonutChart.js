import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

const FULL_CIRCLE = Math.PI * 2;

/**
 * Donut chart drawn directly with react-native-svg.
 *
 * This replaces `victory-native`, which pulled in the whole `victory` bundle
 * (~2.3 MB unpacked, per the npm registry) to render one ring. Stroke-dasharray
 * on a circle is all a donut needs.
 *
 * The ring starts at twelve o'clock by shifting the dash offset a quarter turn
 * rather than by rotating a `<G>`: react-native-svg's `rotation`/`origin` props
 * are native-only, and on react-native-web they emit a bare `rotate(-90)` that
 * spins the chart about the origin and off the canvas.
 */
export default function DonutChart({ slices, size = 176, thickness = 22, testID = 'donut-chart' }) {
  const radius = (size - thickness) / 2;
  const circumference = FULL_CIRCLE * radius;
  const quarterTurn = circumference / 4;

  const segments = useMemo(() => {
    let consumed = 0;
    return slices
      .filter((slice) => slice.share > 0)
      .map((slice) => {
        const length = slice.share * circumference;
        const segment = {
          key: slice.name,
          color: slice.color,
          dasharray: `${length} ${circumference - length}`,
          dashoffset: quarterTurn - consumed,
        };
        consumed += length;
        return segment;
      });
  }, [slices, circumference, quarterTurn]);

  return (
    <View accessible accessibilityRole="image" testID={testID}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.skeleton}
          strokeWidth={thickness}
          fill="none"
        />
        {segments.map((segment) => (
          <Circle
            key={segment.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={segment.color}
            strokeWidth={thickness}
            strokeDasharray={segment.dasharray}
            strokeDashoffset={segment.dashoffset}
            strokeLinecap="butt"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}
