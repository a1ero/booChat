import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Image, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { firebaseConfig } from '../../src/api/configFirebase';

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

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

    const [friendRequestsCount, setFriendRequestsCount] = useState(0);

    useEffect(() => {
        const currentUser = firebase.auth().currentUser;
        const db = firebase.firestore();
        const friendRequestsRef = db.collection('users').doc(currentUser.uid).collection('friendRequests');

        const unsubscribe = friendRequestsRef.onSnapshot((snapshot) => {
            setFriendRequestsCount(snapshot.docs.length);
        });

        return () => unsubscribe();
    }, []);

    return (
        <View style={[styles.container, { height: height * 0.1 }]}>
            <TouchableOpacity onPress={handleHomePress}>
                <Image source={require('../../src/icon/Panel/house.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChatPress}>
                <Image source={require('../../src/icon/Panel/chat-dots.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGeoPress}>
                <Image source={require('../../src/icon/Panel/geo-alt.png')} style={styles.icon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUsersPress}>
                <Image source={require('../../src/icon/Panel/person.png')} style={styles.icon} />
                {friendRequestsCount > 0 && (
                    <View style={styles.friendRequestsCount}>
                        <Text style={styles.friendRequestsCountText}>{friendRequestsCount}</Text>
                    </View>
                )}
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
    friendRequestsCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FF4136',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    friendRequestsCountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Panel;
