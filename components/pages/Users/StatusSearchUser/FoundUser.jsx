import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import { firebaseConfig } from '../../../../src/api/configFirebase';

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const FoundUser = ({ user }) => {
    const [buttonLabel, setButtonLabel] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const checkFriendRequestStatus = async () => {
            try {
                const db = firebase.firestore();
                const currentUser = firebase.auth().currentUser;

                // Поиск документа получателя по электронной почте
                const recipientSnapshot = await db
                    .collection('users')
                    .where('email', '==', user.email)
                    .limit(1)
                    .get();

                if (!recipientSnapshot.empty) {
                    const recipientDoc = recipientSnapshot.docs[0];
                    const recipientId = recipientDoc.id;

                    // Проверка статуса заявки в друзья
                    const friendRequestSnapshot = await db
                        .collection('users')
                        .doc(recipientId)
                        .collection('friendRequests')
                        .doc(currentUser.uid)
                        .get();

                    if (friendRequestSnapshot.exists) {
                        setButtonLabel('Заявка отправлена');
                    } else {
                        // Проверка статуса дружбы
                        const friendsSnapshot = await db
                            .collection('users')
                            .doc(recipientId)
                            .collection('friends')
                            .doc(currentUser.uid)
                            .get();

                        if (friendsSnapshot.exists) {
                            setButtonLabel('В друзьях');
                        } else {
                            setButtonLabel('Добавить в друзья');
                        }
                    }
                } else {
                    console.error('Recipient not found');
                }
            } catch (error) {
                console.error('Error checking friend request status:', error);
            }
        };

        checkFriendRequestStatus();
    }, [user.email]);

    const handleAddFriend = async () => {
        try {
            const db = firebase.firestore();
            const currentUser = firebase.auth().currentUser;

            // Поиск документа получателя по электронной почте
            const recipientSnapshot = await db
                .collection('users')
                .where('email', '==', user.email)
                .limit(1)
                .get();

            if (!recipientSnapshot.empty) {
                const recipientDoc = recipientSnapshot.docs[0];
                const recipientId = recipientDoc.id;

                // Добавление запрос на добавление в друзья в коллекцию «friendRequests» получателя
                await db
                    .collection('users')
                    .doc(recipientId)
                    .collection('friendRequests')
                    .doc(currentUser.uid)
                    .set({
                        senderId: currentUser.uid,
                        senderName: currentUser.displayName,
                        senderAvatar: currentUser.photoURL,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });

                setButtonLabel('Заявка отправлена');
                setShowPopup(true);

                console.log('Friend request sent successfully');
            } else {
                console.error('Recipient not found');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    const closeModal = () => {
        setShowPopup(false);
    };

    return (
        <View style={styles.container}>
            {!showPopup && (
                <>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <Text style={styles.textName}>{user.name}</Text>
                    {buttonLabel === 'Добавить в друзья' && (
                        <TouchableOpacity
                            title={buttonLabel}
                            onPress={handleAddFriend}
                            disabled={buttonLabel === 'Заявка отправлена'}
                        >
                            <Text style={styles.textAddFriend}>{buttonLabel}</Text>
                        </TouchableOpacity>
                    )}
                    {buttonLabel === 'Заявка отправлена' && (
                        <Text style={styles.textRequestSent}>{buttonLabel}</Text>
                    )}
                    {buttonLabel === 'В друзьях' && (
                        <Text style={styles.textInFriends}>{buttonLabel}</Text>
                    )}
                </>
            )}
            <Modal visible={showPopup} animationType="fade" transparent={true}>
                <View style={styles.popupContainer}>
                    <View style={styles.popupContent}>
                        <Image
                            source={require('../../../../src/icon/NewFriends/done_icon.png')}
                            style={styles.popupIcon}
                        />
                        <Text style={styles.popupText}>Заявка отправлена</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 80,
        marginBottom: 16,
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    textName: {
        fontSize: 25,
    },
    textAddFriend: {
        fontSize: 18,
        color: '#2E66E7',
        marginTop: 20,
        textAlign: 'center',
    },
    textRequestSent: {
        fontSize: 18,
        color: 'green',
        marginTop: 20,
        textAlign: 'center',
    },
    textInFriends: {
        fontSize: 18,
        color: '#888',
        marginTop: 20,
        textAlign: 'center',
    },
    popupContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    popupContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    popupIcon: {
        width: 60,
        height: 60,
        marginBottom: 16,
    },
    popupText: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        color: 'green',
    },
    closeButton: {
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    closeButtonText: {
        color: '#2E66E7',
        fontSize: 18,
    },
});

export default FoundUser;
