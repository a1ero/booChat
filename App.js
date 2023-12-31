import React from 'react';
import Registration from "./components/pages/Auth/Registration";
import Login from "./components/pages/Auth/Login";
import Home from "./components/pages/Account/Home"

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Main from "./components/pages/Account/Main";
import Chat from "./components/pages/Chat/Chat";
import UserPage from "./components/pages/Users/UserPage";
import ForgotPassword from "./components/pages/Auth/ForgotPassword";
import NewFriends from "./components/pages/Users/Friends/NewFriends/NewFriends";
import ChatOneUser from "./components/pages/Chat/ChatForOneUser/ChatOneUser";

const Stack = createStackNavigator();

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    headerBackTitleVisible: false,
                }}
            >
                <Stack.Screen
                    name="Login"
                    component={Login}
                />
                <Stack.Screen
                    name="Registration"
                    component={Registration}
                />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPassword}
                />
                <Stack.Screen
                    name="Main"
                    component={Main}
                />
                <Stack.Screen
                    name="Chat"
                    component={Chat}
                />
                <Stack.Screen
                    name="User"
                    component={UserPage}
                />
                <Stack.Screen
                    name="NewFriends"
                    component={NewFriends}
                />
                <Stack.Screen
                    name="ChatOneUser"
                    component={ChatOneUser}
                />
                {/*<Stack.Screen name="Home" component={Home} />*/}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
