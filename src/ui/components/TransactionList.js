import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { EmptyState } from './StateView';
import TransactionRow, { ROW_HEIGHT } from './TransactionRow';
import { spacing } from '../theme';

const ROW_STRIDE = ROW_HEIGHT + spacing.sm;

/**
 * A windowed list. The original screen rendered a single hardcoded row inside a
 * fixed-height `View`; a real ledger is unbounded, so it has to be virtualised.
 * `getItemLayout` is supplied because every row is a fixed height, which lets
 * FlatList skip measurement entirely and scroll without layout jank.
 */
export default function TransactionList({
  transactions,
  onSelect,
  emptyTitle = 'No transactions yet',
  emptyBody,
  ListHeaderComponent,
  testID = 'transaction-list',
  ...rest
}) {
  const renderItem = useCallback(
    ({ item }) => <TransactionRow transaction={item} onPress={onSelect} />,
    [onSelect],
  );

  const getItemLayout = useCallback(
    (_data, index) => ({ length: ROW_STRIDE, offset: ROW_STRIDE * index, index }),
    [],
  );

  return (
    <FlatList
      testID={testID}
      data={transactions}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      initialNumToRender={12}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyState title={emptyTitle} body={emptyBody} />}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      {...rest}
    />
  );
}

function keyExtractor(item, index) {
  return item.id === null || item.id === undefined ? `tx-${index}` : String(item.id);
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
});
