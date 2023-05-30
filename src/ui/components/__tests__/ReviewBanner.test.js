import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import ReviewBanner from '../ReviewBanner';

describe('ReviewBanner', () => {
  it('shows the real count from the data, not a hardcoded one', () => {
    render(<ReviewBanner count={3} onPress={jest.fn()} />);
    expect(screen.getByText('3 new transactions to review')).toBeOnTheScreen();
  });

  it('uses the singular for one transaction', () => {
    render(<ReviewBanner count={1} onPress={jest.fn()} />);
    expect(screen.getByText('1 new transaction to review')).toBeOnTheScreen();
  });

  it('becomes an inert confirmation when the queue is empty', () => {
    const onPress = jest.fn();
    render(<ReviewBanner count={0} onPress={onPress} />);
    expect(screen.getByText('All transactions reviewed')).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId('review-banner'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('opens the queue when there is something to review', () => {
    const onPress = jest.fn();
    render(<ReviewBanner count={2} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('review-banner'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
