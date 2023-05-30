import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { normalizeTransactions } from '../../../domain/transactions';
import { transactionsPayload } from '../../../test-support/fixtures';
import TransactionRow from '../TransactionRow';

const [, flight, , , , salary] = normalizeTransactions(transactionsPayload);

describe('TransactionRow', () => {
  it('renders the name, merchant, formatted amount and date', () => {
    render(<TransactionRow transaction={flight} />);
    expect(screen.getByText('SFO to JFK')).toBeOnTheScreen();
    expect(screen.getByText('United')).toBeOnTheScreen();
    expect(screen.getByText('$129.97')).toBeOnTheScreen();
    expect(screen.getByText('May 29, 2023')).toBeOnTheScreen();
  });

  it('shows income with an explicit plus', () => {
    render(<TransactionRow transaction={salary} />);
    expect(screen.getByText('+$2,400.00')).toBeOnTheScreen();
  });

  it('describes its review state to assistive technology', () => {
    render(<TransactionRow transaction={flight} />);
    expect(screen.getByLabelText(/needs review/)).toBeOnTheScreen();
  });

  it('passes the transaction to onPress', () => {
    const onPress = jest.fn();
    render(<TransactionRow transaction={flight} onPress={onPress} />);
    fireEvent.press(screen.getByTestId('transaction-row-2'));
    expect(onPress).toHaveBeenCalledWith(flight);
  });

  it('renders a transaction with no category rather than crashing', () => {
    render(<TransactionRow transaction={{ ...flight, category: null }} />);
    expect(screen.getByText('SFO to JFK')).toBeOnTheScreen();
  });
});
