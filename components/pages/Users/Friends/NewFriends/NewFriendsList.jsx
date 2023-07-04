import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { firebaseConfig } from '../../../../../src/api/configFirebase';
import Line from "../../../../component/Line";

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const NewFriendsList = () => {
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        // Получение запроса на добавление в друзья для текущего пользователя
        const currentUser = firebase.auth().currentUser;
        const db = firebase.firestore();
        const friendRequestRef = db
            .collection('users')
            .doc(currentUser.uid)
            .collection('friendRequests');

        const unsubscribe = friendRequestRef.onSnapshot((snapshot) => {
            const requests = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setFriendRequests(requests);
        });

        return () => unsubscribe();
    }, []);

    const handleAcceptFriendRequest = async (friendRequestId) => {
        try {
            const currentUser = firebase.auth().currentUser;
            const db = firebase.firestore();

            // Перемещение запрос на добавление в друзья из коллекции friendRequests в коллекцию друзей для текущего пользователя
            const friendRequestRef = db
                .collection('users')
                .doc(currentUser.uid)
                .collection('friendRequests')
                .doc(friendRequestId);
            const friendRequestDoc = await friendRequestRef.get();
            const friendData = friendRequestDoc.data();

            // Создание документ друга в коллекции "friend" для текущего пользователя
            const currentUserFriendsRef = db
                .collection('users')
                .doc(currentUser.uid)
                .collection('friends')
                .doc(friendData.senderId);
            await currentUserFriendsRef.set({
                name: friendData.senderName,
                avatar: friendData.senderAvatar,
            });

            // Создание документ друга в коллекции "friend" для отправителя
            const senderFriendsRef = db
                .collection('users')
                .doc(friendData.senderId)
                .collection('friends')
                .doc(currentUser.uid);
            await senderFriendsRef.set({
                name: currentUser.displayName,
                avatar: currentUser.photoURL,
            });

            // Удаление запрос на добавление в друзья из коллекции friendRequests
            await friendRequestRef.delete();

            console.log('Friend request accepted successfully');
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    return (
        <View>
            <Text style={styles.heading}>Заявки в друзья</Text>
            <Line/>
            <FlatList
                data={friendRequests}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.friendRequestContainer}>
                        <View style={styles.contentView}>
                            <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                            <Text style={styles.friendName}>{item.senderName}</Text>
                        </View>
                        <View style={styles.contentBtnAccept}>
                            <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => handleAcceptFriendRequest(item.id)}
                            >
                                <Text style={styles.acceptButtonText}>Принять</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    friendRequestContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
        paddingLeft: '5%',
        paddingRight: '5%',
    },
    contentView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 100,
        marginRight: 10,
    },
    friendName: {
        fontSize: 25,
    },
    contentBtnAccept: {

    },
    acceptButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default NewFriendsList;
