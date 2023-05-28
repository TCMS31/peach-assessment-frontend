import { useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { refresh, useDashboard } from '../../state/apiState';
import ReviewBanner from '../../ui/components/ReviewBanner';
import Screen from '../../ui/components/Screen';
import SpendingSummary from '../../ui/components/SpendingSummary';
import { ErrorState, LoadingState } from '../../ui/components/StateView';
import TransactionList from '../../ui/components/TransactionList';
import { spacing, typography } from '../../ui/theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const dashboard = useDashboard();

  const openReview = useCallback(
    (transaction) => {
      navigation.navigate('ReviewTransaction', { transactionId: transaction.id });
    },
    [navigation],
  );

  const openQueue = useCallback(() => {
    const [next] = dashboard.pendingTransactions;
    if (next) {
      openReview(next);
    }
  }, [dashboard.pendingTransactions, openReview]);

  if (dashboard.status === 'loading') {
    return (
      <Screen centered testID="home-screen">
        <LoadingState label="Loading your transactions" />
      </Screen>
    );
  }

  if (dashboard.status === 'error') {
    return (
      <Screen centered testID="home-screen">
        <ErrorState
          title="Could not reach the Peach API"
          body={dashboard.error ?? undefined}
          onRetry={refresh}
        />
      </Screen>
    );
  }

  const header = (
    <View style={styles.header}>
      <SpendingSummary categories={dashboard.topCategories} total={dashboard.totalSpend} />
      <ReviewBanner count={dashboard.pendingTransactions.length} onPress={openQueue} />
      <Text style={styles.sectionTitle}>Recent transactions</Text>
    </View>
  );

  return (
    <Screen testID="home-screen">
      <TransactionList
        transactions={dashboard.recentTransactions}
        onSelect={openReview}
        ListHeaderComponent={header}
        emptyTitle="No transactions yet"
        emptyBody="Seed the backend with `bundle exec rake db:seed` to see data here."
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
});
