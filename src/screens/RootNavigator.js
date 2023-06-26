import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import HomeScreen from './HomeScreen';
import Category from './Category';
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native';


const RootNavigator = () => {

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }}>
                <NavigationContainer>
            <Stack.Navigator
            initialRouteName="HomeScreen"
           >
            <Stack.Group>
                <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Group>
            <Stack.Group>
             <Stack.Screen name="SelectCategory" component={Category} />
            </Stack.Group>
        </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default RootNavigator;
