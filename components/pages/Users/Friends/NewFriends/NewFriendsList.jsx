import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
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
    const [selectedFriend, setSelectedFriend] = useState(null);

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

            // Перемещение запроса на добавление в друзья из коллекции friendRequests в коллекцию друзей для текущего пользователя
            const friendRequestRef = db
                .collection('users')
                .doc(currentUser.uid)
                .collection('friendRequests')
                .doc(friendRequestId);
            const friendRequestDoc = await friendRequestRef.get();
            const friendData = friendRequestDoc.data();

            // Создание документа друга в коллекции "friends" для текущего пользователя
            const currentUserFriendsRef = db
                .collection('users')
                .doc(currentUser.uid)
                .collection('friends')
                .doc(friendData.senderId);
            await currentUserFriendsRef.set({
                name: friendData.senderName,
                avatar: friendData.senderAvatar,
            });

            // Создание документа друга в коллекции "friends" для отправителя
            const senderFriendsRef = db
                .collection('users')
                .doc(friendData.senderId)
                .collection('friends')
                .doc(currentUser.uid);
            await senderFriendsRef.set({
                name: currentUser.displayName,
                avatar: currentUser.photoURL,
            });

            // Удаление запроса на добавление в друзья из коллекции friendRequests
            await friendRequestRef.delete();

            console.log('Friend request accepted successfully');
            closeModal();
        } catch (error) {
            console.error('Error accepting friend request:', error);
        }
    };

    const handleRejectFriendRequest = async (friendRequestId) => {
        try {
            const db = firebase.firestore();
            const friendRequestRef = db
                .collection('users')
                .doc(firebase.auth().currentUser.uid)
                .collection('friendRequests')
                .doc(friendRequestId);

            await friendRequestRef.delete();
            console.log('Friend request rejected successfully');
            closeModal();
        } catch (error) {
            console.error('Error rejecting friend request:', error);
        }
    };

    const openModal = (friend) => {
        setSelectedFriend(friend);
    };

    const closeModal = () => {
        setSelectedFriend(null);
    };

    return (
        <View>
            <Text style={styles.heading}>Заявки в друзья</Text>
            {friendRequests.length === 0 ? (
                <Text style={styles.emptyText}>Список заявок пуст</Text>
            ) : (
                <>
                    <Line />
                    <FlatList
                        data={friendRequests}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.friendRequestContainer}>
                                <TouchableOpacity onPress={() => openModal(item)}>
                                    <View style={styles.contentView}>
                                        <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
                                        <Text style={styles.friendName}>{item.senderName}</Text>
                                    </View>
                                </TouchableOpacity>
                                <View>
                                    <TouchableOpacity onPress={() => openModal(item)}>
                                        <Text style={styles.viewButton}>Посмотреть</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                </>
            )}
            {selectedFriend && (
                <Modal
                    visible={true}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Image source={{ uri: selectedFriend.senderAvatar }} style={styles.modalAvatar} />
                            <Text style={styles.modalFriendName}>{selectedFriend.senderName}</Text>
                            <View style={styles.modalBtn}>
                                <TouchableOpacity style={styles.modalAcceptButton} onPress={() => handleAcceptFriendRequest(selectedFriend.id)}>
                                    <Text style={styles.modalAcceptButtonText}>Принять</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.modalRejectButton} onPress={() => handleRejectFriendRequest(selectedFriend.id)}>
                                    <Text style={styles.modalRejectButtonText}>Отклонить</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                                <Text style={styles.modalCloseButtonText}>Закрыть</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    friendRequestContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 30,
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
        fontSize: 20,
    },
    containerBtn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    contentBtnAccept: {},
    acceptButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
    },
    acceptButtonText: {
        color: 'white',
        fontSize: 18,
    },
    contentBtnCancel: {},
    iconCancel: {
        width: 25,
        height: 25,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '10%',
        borderRadius: 20,
        alignItems: 'center',
    },
    modalAvatar: {
        width: 180,
        height: 180,
        borderRadius: 100,
        marginBottom: 10,
    },
    modalFriendName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalBtn: {
        display: 'flex',
        flexDirection: 'row',
        width: '80%',
    },
    modalAcceptButton: {
        backgroundColor: '#2ECC71',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        marginBottom: 10,
        marginRight: '20%'
    },
    modalAcceptButtonText: {
        color: 'white',
        fontSize: 18,
    },
    modalRejectButton: {
        backgroundColor: '#FF4D4D',
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        marginBottom: 10,
    },
    modalRejectButtonText: {
        color: 'white',
        fontSize: 18,
    },
    modalCloseButton: {
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    modalCloseButtonText: {
        color: '#2E66E7',
        fontSize: 18,
    },
    viewButton: {
        fontSize: 18,
        color: "#2E66E7",
    },
});

export default NewFriendsList;
