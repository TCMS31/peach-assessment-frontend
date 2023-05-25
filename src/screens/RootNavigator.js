import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CategoryPickerScreen from './CategoryPicker';
import HomeScreen from './HomeScreen';
import ReviewTransactionScreen from './ReviewTransaction';
import { colors, typography } from '../ui/theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: typography.sectionTitle,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

/**
 * `SafeAreaProvider` supplies the insets and the native-stack header consumes
 * them. Wrapping this in a `SafeAreaView` as well would double-pad the top on
 * iOS.
 */
export default function RootNavigator() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Spending' }} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen
              name="ReviewTransaction"
              component={ReviewTransactionScreen}
              options={{ title: 'Review transaction' }}
            />
            <Stack.Screen
              name="CategoryPicker"
              component={CategoryPickerScreen}
              options={{ title: 'Select category' }}
            />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
