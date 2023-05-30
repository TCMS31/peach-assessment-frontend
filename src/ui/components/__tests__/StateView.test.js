import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { EmptyState, ErrorState, LoadingState } from '../StateView';

describe('StateView', () => {
  it('labels the loading state', () => {
    render(<LoadingState label="Loading your transactions" />);
    expect(screen.getByText('Loading your transactions')).toBeOnTheScreen();
  });

  it('renders an empty state with guidance', () => {
    render(<EmptyState title="Nothing here" body="Seed the backend." />);
    expect(screen.getByText('Nothing here')).toBeOnTheScreen();
    expect(screen.getByText('Seed the backend.')).toBeOnTheScreen();
  });

  it('offers a retry only when a handler is given', () => {
    const onRetry = jest.fn();
    render(<ErrorState body="offline" onRetry={onRetry} />);
    fireEvent.press(screen.getByTestId('state-error-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);

    render(<ErrorState body="offline" />);
    expect(screen.queryByTestId('state-error-retry')).toBeNull();
  });
});
