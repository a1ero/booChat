import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Modal } from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { firebaseConfig } from '../../../../src/api/configFirebase';


// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const FriendList = ({navigation}) => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);


    useEffect(() => {
        // Получение друзей для текущего пользователя
        const currentUser = firebase.auth().currentUser;
        const db = firebase.firestore();
        const friendsRef = db.collection('users').doc(currentUser.uid).collection('friends');

        const unsubscribe = friendsRef.onSnapshot((snapshot) => {
            const friends = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setFriends(friends);
        });

        return () => unsubscribe();
    }, []);

    const handleRemoveFriend = async (friendId) => {
        try {
            const currentUser = firebase.auth().currentUser;
            const db = firebase.firestore();

            // Удаление друга из коллекции "friends" текущего пользователя
            const currentUserRef = db
                .collection('users')
                .doc(currentUser.uid)
                .collection('friends')
                .doc(friendId);
            await currentUserRef.delete();

            // Удаление текущего пользователя из коллекции друзей друга
            const friendRef = db
                .collection('users')
                .doc(friendId)
                .collection('friends')
                .doc(currentUser.uid);
            await friendRef.delete();

            console.log('Friend removed successfully');
            setSelectedFriend(null); // Закрытие модального окна после удаления друга
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    };

    const openProfileModal = (friend) => {
        setSelectedFriend(friend);
    };

    const closeProfileModal = () => {
        setSelectedFriend(null);
    };

    return (
        <View>
            <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.friendContainer}>
                        <TouchableOpacity onPress={() => openProfileModal(item)}>
                            <View style={styles.contentFriend}>
                                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                                <Text style={styles.friendName}>{item.name}</Text>
                            </View>
                        </TouchableOpacity>
                        <View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => navigation.navigate('Main')}
                            >
                                <Text style={styles.removeButtonText}>Send</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {selectedFriend && (
                <Modal
                    visible={true}
                    animationType="slide"
                    onRequestClose={closeProfileModal}
                >
                    <View style={styles.modalContainer}>
                        <Image source={{ uri: selectedFriend.avatar }} style={styles.modalAvatar} />
                        <Text style={styles.modalTitle}>{selectedFriend.name}</Text>
                        <TouchableOpacity
                            style={styles.modalRemoveButton}
                            onPress={() => handleRemoveFriend(selectedFriend.id)}
                        >
                            <Text style={styles.modalRemoveButtonText}>Удалить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={closeProfileModal}
                        >
                            <Text style={styles.modalCloseButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    friendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
    },
    contentFriend: {
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
        fontSize: 18,
        marginRight: 'auto',
    },
    removeButton: {
        backgroundColor: '#FF4136',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalAvatar: {
        width: 120,
        height: 120,
        borderRadius: 100,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalRemoveButton: {
        backgroundColor: '#FF4136',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalRemoveButtonText: {
        color: 'white',
        fontSize: 22,
    },
    modalCloseButton: {
        marginTop: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    modalCloseButtonText: {
        color: '#2E66E7',
        fontSize: 20,
    },
});

export default FriendList;
