import React from 'react';
import {StyleSheet, View} from 'react-native';
import Registration from "./components/Registration";
import Login from "./components/Login";
import Home from "./components/Home"

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Login" component={Login} />
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="Registration" component={Registration} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
const styles = StyleSheet.create({

});
