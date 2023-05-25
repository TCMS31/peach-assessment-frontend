import { StatusBar } from 'expo-status-bar';
import React from 'react';

import RootNavigator from './src/screens/RootNavigator';
import { useBootstrap } from './src/state/apiState';

/**
 * Composition root. Data loading is kicked off once here; everything else is
 * read from the store through hooks, so no screen owns fetching logic.
 */
export default function App() {
  useBootstrap();

  return (
    <>
      <StatusBar style="dark" />
      <RootNavigator />
    </>
  );
}
