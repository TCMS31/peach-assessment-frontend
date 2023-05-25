import { render } from '@testing-library/react-native';
import React from 'react';

import DonutChart from '../DonutChart';

const slices = [
  { name: 'Travel', color: '#FFECC6', share: 0.5 },
  { name: 'Shops', color: '#B6E4FB', share: 0.25 },
  { name: 'Food', color: '#FFC9C9', share: 0.25 },
];

function arcs(tree) {
  // One track circle is always drawn behind the slices.
  return tree.root.findAllByType('RNSVGCircle').slice(1);
}

/** react-native-svg normalises strokeDasharray to a numeric array. */
function dashPair(arc) {
  const raw = arc.props.strokeDasharray;
  const parts = Array.isArray(raw) ? raw : String(raw).split(/[\s,]+/);
  return parts.map(Number);
}

describe('DonutChart', () => {
  it('draws one arc per non-zero slice', () => {
    expect(arcs(render(<DonutChart slices={slices} />))).toHaveLength(3);
  });

  it('skips zero-width slices instead of drawing invisible arcs', () => {
    const withZero = [...slices, { name: 'Taxes', color: '#C5C8FF', share: 0 }];
    expect(arcs(render(<DonutChart slices={withZero} />))).toHaveLength(3);
  });

  it('lays the arcs end to end so they cover the full circle', () => {
    const drawn = arcs(render(<DonutChart slices={slices} />));
    const lengths = drawn.map((arc) => dashPair(arc)[0]);
    const offsets = drawn.map((arc) => Number(arc.props.strokeDashoffset));
    const circumference = dashPair(drawn[0])[0] + dashPair(drawn[0])[1];

    expect(lengths.reduce((a, b) => a + b, 0)).toBeCloseTo(circumference, 6);
    expect(offsets[1]).toBeCloseTo(offsets[0] - lengths[0], 6);
    expect(offsets[2]).toBeCloseTo(offsets[0] - lengths[0] - lengths[1], 6);
  });

  it('starts the ring at twelve o clock without rotating a group', () => {
    // A <G rotation>/origin pair is native-only; on react-native-web it emits a
    // bare rotate(-90) about the origin and throws the chart off the canvas.
    const tree = render(<DonutChart slices={slices} />);
    const rotated = tree.root.findAll(
      (node) => node.props?.rotation !== undefined || node.props?.origin !== undefined,
      { deep: true },
    );
    expect(rotated).toHaveLength(0);

    const drawn = arcs(tree);
    const circumference = dashPair(drawn[0])[0] + dashPair(drawn[0])[1];
    expect(Number(drawn[0].props.strokeDashoffset)).toBeCloseTo(circumference / 4, 6);
  });

  it('renders nothing but the track for an empty dataset', () => {
    expect(arcs(render(<DonutChart slices={[]} />))).toHaveLength(0);
  });
});
