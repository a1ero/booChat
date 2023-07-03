import React from 'react';
import {View, StyleSheet, Text, useWindowDimensions, Image, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import '../pages/Account/Home'
import '../pages/Users/UserPage'

const Panel = () => {
    const navigation = useNavigation();
    const { height } = useWindowDimensions();

    const handleHomePress = () => {
        navigation.navigate('Main');
    };
    const handleChatPress = () => {
        navigation.navigate('Chat');
    };
    const handleGeoPress = () => {
        navigation.navigate('Chat');
    };
    const handleUsersPress = () => {
        navigation.navigate('User');
    };

    return (
        <View style={[styles.container, { height: height * 0.1 }]}>
            <TouchableOpacity onPress={handleHomePress}>
                <Image source={require('../../src/icon/house.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChatPress}>
                <Image source={require('../../src/icon/chat-dots.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGeoPress}>
                <Image source={require('../../src/icon/geo-alt.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUsersPress}>
                <Image source={require('../../src/icon/person.png')} style={styles.icon} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: '10%',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    icon: {
        height: 30,
        width: 30,
        resizeMode: 'contain',
    },
});

export default Panel;
