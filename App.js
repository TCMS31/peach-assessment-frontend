import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import apiActions from './app/actions/apiActions';
import apiStore from './app/stores/apiStore';
import RootNavigator from './src/screens/RootNavigator';

export default function App() {
  useEffect(() => {
    const unsubscribe = apiStore.listen(onStateChange);

    apiActions.getCategories();
    apiActions.getMerchants();

    return () => unsubscribe;
  }, []);

  const onStateChange = data => {
    switch (data.target) {
      case 'UPDATE_CATEGORIES':
        updateCategories();
      case 'UPDATE_MERCHANTS':
        updateMerchants();
      default:
        return;
    }
  };

  const updateCategories = () => {
    const currentState = apiStore.getCurrentState();
    console.log('Received Categories: ' + JSON.stringify(currentState.categories));
  };

  const updateMerchants = () => {
    const currentState = apiStore.getCurrentState();
    console.log('Received Merchants: ' + JSON.stringify(currentState.merchants));
  };

  return (
   <RootNavigator/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
