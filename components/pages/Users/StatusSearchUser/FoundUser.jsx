import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from 'firebase/compat/app';
import { firebaseConfig } from '../../../../src/api/configFirebase';

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const FoundUser = ({ user }) => {
    const [buttonLabel, setButtonLabel] = useState('Добавить в друзья');

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

                console.log('Friend request sent successfully');
            } else {
                console.error('Recipient not found');
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={styles.textName}>{user.name}</Text>
            <TouchableOpacity title={buttonLabel} onPress={handleAddFriend}>
                <Text style={buttonLabel === 'Добавить в друзья' ? styles.textAddFriend : styles.textRequestSent}>{buttonLabel}</Text>
            </TouchableOpacity>
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
});

export default FoundUser;
