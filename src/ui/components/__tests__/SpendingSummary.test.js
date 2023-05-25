import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { normalizeTransactions, topCategories, totalSpend } from '../../../domain/transactions';
import { transactionsPayload } from '../../../test-support/fixtures';
import SpendingSummary, { describeChart } from '../SpendingSummary';

const transactions = normalizeTransactions(transactionsPayload);

describe('SpendingSummary', () => {
  it('renders a legend entry and a slice per category', () => {
    const categories = topCategories(transactions);
    render(<SpendingSummary categories={categories} total={totalSpend(transactions)} />);

    expect(screen.getByText('Travel')).toBeOnTheScreen();
    expect(screen.getByText('$175.09')).toBeOnTheScreen();
    expect(screen.getByTestId('donut-chart')).toBeOnTheScreen();
  });

  it('shows the computed total, excluding income', () => {
    render(
      <SpendingSummary categories={topCategories(transactions)} total={totalSpend(transactions)} />,
    );
    expect(screen.getByTestId('spending-total')).toHaveTextContent('$256.36');
  });

  it('shows an empty state instead of an empty chart', () => {
    render(<SpendingSummary categories={[]} total={0} />);
    expect(screen.getByTestId('state-empty')).toBeOnTheScreen();
    expect(screen.queryByTestId('donut-chart')).toBeNull();
  });

  it('gives the chart a spoken summary of every slice', () => {
    const categories = topCategories(transactions);
    const label = describeChart(categories, totalSpend(transactions));
    expect(label).toBe(
      'Spending by category, $256.36 in total: Travel 68%, Shops 24%, Food and Drink 5%, Subscription Service 3%',
    );
    render(<SpendingSummary categories={categories} total={totalSpend(transactions)} />);
    expect(screen.getByTestId('donut-chart')).toHaveProp('accessibilityLabel', label);
  });
});
