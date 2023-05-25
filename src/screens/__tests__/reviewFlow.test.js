import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

import apiActions, { configureApi } from '../../../app/actions/apiActions';
import apiStore from '../../../app/stores/apiStore';
import { createHttpClient } from '../../api/httpClient';
import { createPeachApi } from '../../api/peachApi';
import { combineStatus, refresh } from '../../state/apiState';
import {
  categoriesPayload,
  createFetchStub,
  merchantsPayload,
  transactionsPayload,
} from '../../test-support/fixtures';
import CategoryPickerScreen from '../CategoryPicker';
import HomeScreen from '../HomeScreen';
import ReviewTransactionScreen from '../ReviewTransaction';

const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() };
let mockRouteParams = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => ({ params: mockRouteParams }),
}));

const BASE_URL = 'http://localhost:3000';

function stubNetwork(overrides = {}) {
  const fetchImpl = createFetchStub({
    '/categories': { body: categoriesPayload },
    '/merchants': { body: merchantsPayload },
    '/transactions': { body: transactionsPayload },
    '/transactions/2': { body: { ...transactionsPayload[1], reviewed: true } },
    ...overrides,
  });
  configureApi(createPeachApi(createHttpClient({ baseUrl: BASE_URL, fetchImpl })));
  return fetchImpl;
}

/** Loads the store the way the app does: through the real HTTP stack. */
async function loadStore() {
  await act(async () => {
    apiActions.getCategories();
    apiActions.getMerchants();
    apiActions.getTransactions();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

describe('review flow', () => {
  beforeEach(() => {
    mockNavigation.navigate.mockClear();
    mockNavigation.goBack.mockClear();
    mockRouteParams = {};
    act(() => apiStore.resetForTests());
  });

  afterEach(() => {
    act(() => apiStore.resetForTests());
    configureApi(null);
  });

  it('shows a loading state before any data arrives', () => {
    stubNetwork();
    render(<HomeScreen />);
    expect(screen.getByTestId('state-loading')).toBeOnTheScreen();
  });

  it('renders the dashboard from the API response', async () => {
    stubNetwork();
    await loadStore();
    render(<HomeScreen />);

    expect(screen.getByTestId('spending-total')).toHaveTextContent('$256.36');
    expect(screen.getByText('2 new transactions to review')).toBeOnTheScreen();
    expect(screen.getByText('SFO to JFK')).toBeOnTheScreen();
    expect(screen.getByText('May salary')).toBeOnTheScreen();
  });

  it('requests the real endpoints, with no placeholder left in the URL', async () => {
    const fetchImpl = stubNetwork();
    await loadStore();

    const urls = fetchImpl.calls.map((call) => call.url);
    expect(urls).toEqual([
      'http://localhost:3000/categories',
      'http://localhost:3000/merchants',
      'http://localhost:3000/transactions',
    ]);
    for (const url of urls) {
      expect(url).not.toMatch(/undefined|null|\s/);
    }
  });

  it('opens the review screen for the transaction that was tapped', async () => {
    stubNetwork();
    await loadStore();
    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('transaction-row-2'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ReviewTransaction', { transactionId: 2 });
  });

  it('opens the first pending transaction from the review banner', async () => {
    stubNetwork();
    await loadStore();
    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('review-banner'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ReviewTransaction', { transactionId: 2 });
  });

  it('surfaces an API failure instead of rendering an empty dashboard', async () => {
    stubNetwork({ '/transactions': { status: 500, body: {} } });
    await loadStore();
    render(<HomeScreen />);

    expect(screen.getByTestId('state-error')).toBeOnTheScreen();
    expect(screen.getByText(/HTTP 500/)).toBeOnTheScreen();
  });

  it('PATCHes the transaction and returns only after the server confirms', async () => {
    const fetchImpl = stubNetwork();
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(<ReviewTransactionScreen />);

    expect(screen.getByTestId('review-amount')).toHaveTextContent('$129.97');
    expect(mockNavigation.goBack).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getByTestId('review-submit'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const patch = fetchImpl.calls.find((call) => call.options.method === 'PATCH');
    expect(patch.url).toBe('http://localhost:3000/transactions/2');
    expect(JSON.parse(patch.options.body)).toEqual({ transaction: { reviewed: true } });

    await waitFor(() => expect(mockNavigation.goBack).toHaveBeenCalled());
    expect(apiStore.getCurrentState().transactions.data.find((tx) => tx.id === 2).reviewed).toBe(
      true,
    );
  });

  it('stays on the screen and shows the error when the PATCH fails', async () => {
    stubNetwork({ '/transactions/2': { status: 422, body: {} } });
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(<ReviewTransactionScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('review-submit'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // The bug this guards against: navigating away as though the write worked.
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
    expect(screen.getByTestId('review-error')).toHaveTextContent(/HTTP 422/);
  });

  it('builds the category grid from the API, not from a hardcoded list', async () => {
    stubNetwork();
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(<CategoryPickerScreen />);

    for (const category of categoriesPayload) {
      expect(screen.getByTestId(`category-tile-${category.name}`)).toBeOnTheScreen();
    }
    // "Taxes" has no bundled artwork and still renders, via its emoji.
    expect(screen.getByTestId('category-tile-Taxes')).toBeOnTheScreen();
  });

  it('shows the server validation message when a category is rejected', async () => {
    stubNetwork({
      '/transactions/2': { status: 422, body: { message: ['Category is not valid'] } },
    });
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(<CategoryPickerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('category-tile-Taxes'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('category-picker-error')).toHaveTextContent(
      'Category is not valid (HTTP 422)',
    );
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });

  it('assigns the chosen category through the nested Rails payload', async () => {
    const fetchImpl = stubNetwork();
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(<CategoryPickerScreen />);

    await act(async () => {
      fireEvent.press(screen.getByTestId('category-tile-Food and Drink'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const patch = fetchImpl.calls.find((call) => call.options.method === 'PATCH');
    expect(JSON.parse(patch.options.body)).toEqual({
      transaction: { category_attributes: { name: 'Food and Drink', emoji: '🍕' } },
    });
    await waitFor(() => expect(mockNavigation.goBack).toHaveBeenCalled());
  });

  it('keeps the dashboard on screen while a pull-to-refresh is in flight', async () => {
    stubNetwork();
    await loadStore();
    render(<HomeScreen />);

    const never = () => new Promise(() => {});
    configureApi({ getCategories: never, getMerchants: never, getTransactions: never });
    await act(async () => {
      refresh();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.queryByTestId('state-loading')).toBeNull();
    expect(screen.getByTestId('spending-total')).toHaveTextContent('$256.36');
    expect(apiStore.getCurrentState().transactions.status).toBe('loading');
  });

  it('keeps cached data on screen and says so when a refresh fails', async () => {
    stubNetwork();
    await loadStore();
    render(<HomeScreen />);
    expect(screen.queryByTestId('refresh-error')).toBeNull();

    stubNetwork({ '/transactions': { status: 503, body: {} } });
    await act(async () => {
      refresh();
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('refresh-error')).toHaveTextContent(/HTTP 503/);
    expect(screen.getByTestId('spending-total')).toHaveTextContent('$256.36');
  });

  it('leaves the review card open, on the new category, after the picker saves', async () => {
    stubNetwork({
      '/transactions/2': {
        body: { ...transactionsPayload[1], category: categoriesPayload[1] },
      },
    });
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    // Both routes are mounted while the picker is open: the picker sits on top
    // of the review card in the same modal stack.
    render(
      <>
        <ReviewTransactionScreen />
        <CategoryPickerScreen />
      </>,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('category-tile-Food and Drink'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Only the picker closes; the review card stays so it can be marked reviewed.
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('review-category')).toHaveTextContent(/Food and Drink/);
    expect(screen.getByTestId('review-submit')).toBeEnabled();
  });

  it('shows a failed category save only on the picker that sent it', async () => {
    stubNetwork({ '/transactions/2': { status: 422, body: {} } });
    await loadStore();
    mockRouteParams = { transactionId: 2 };
    render(
      <>
        <ReviewTransactionScreen />
        <CategoryPickerScreen />
      </>,
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('category-tile-Travel'));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(screen.getByTestId('category-picker-error')).toHaveTextContent(/HTTP 422/);
    expect(screen.queryByTestId('review-error')).toBeNull();
    expect(mockNavigation.goBack).not.toHaveBeenCalled();
  });
});

describe('combineStatus', () => {
  const slice = (status, data = [], updatedAt = null) => ({ status, data, error: null, updatedAt });

  it.each([
    ['nothing requested yet', [slice('idle')], 'loading'],
    ['first load in flight', [slice('loading')], 'loading'],
    ['all answered', [slice('ready', [1], 1), slice('ready', [], 1)], 'ready'],
    ['reloading answered data', [slice('loading', [1], 1)], 'ready'],
    ['reloading an answered empty list', [slice('loading', [], 1)], 'ready'],
    ['one slice failed with nothing to show', [slice('ready', [1], 1), slice('error')], 'error'],
  ])('%s -> %s', (_label, slices, expected) => {
    expect(combineStatus(slices)).toBe(expected);
  });
});
