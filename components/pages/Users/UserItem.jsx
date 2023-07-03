import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal, Alert } from "react-native";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from "firebase/compat/app";
import { firebaseConfig } from "../../../src/api/configFirebase";
import FoundUser from "../Users/StatusSearchUser/FoundUser";

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const UserItem = () => {
    const [email, setEmail] = useState("");
    const [userFound, setUserFound] = useState(false);
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false); // Состояние для отслеживания видимости модального окна
    const [searched, setSearched] = useState(false); // Состояние для отслеживания, был ли выполнен поиск

    const handleSearchFriend = () => {
        // Проверка валидности email
        if (!validateEmail(email)) {
            Alert.alert('Ошибка', 'Пожалуйста, введите правильный email');
            return;
        }

        const db = firebase.firestore();
        db.collection("users")
            .where("email", "==", email)
            .get()
            .then((snapshot) => {
                if (!snapshot.empty) {
                    const userData = snapshot.docs[0].data();
                    setUser(userData);
                    setUserFound(true);
                    setShowModal(true); // Открыть модальное окно при успешном поиске
                } else {
                    setUserFound(false);
                }
            })
            .catch((error) => {
                console.error("Ошибка при поиске пользователя", error);
            })
            .finally(() => {
                setSearched(true); // Устанавливаем состояние, что поиск выполнен
            });
    };

    // Функция для закрытия модального окна
    const closeModal = () => {
        setShowModal(false);
    };

    // Функция для проверки валидности email
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.textSearchFriend}>Найти друга</Text>
            <View style={styles.contentView}>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email"
                    style={styles.textInput}
                />
                <TouchableOpacity title="Найти" onPress={handleSearchFriend}>
                    <Text style={styles.searchText}>Найти</Text>
                </TouchableOpacity>
            </View>
            {!userFound && searched && (
                <View style={styles.notFoundContainer}>
                    <Text style={styles.notFoundText}>Пользователь не найден</Text>
                </View>
            )}

            {/* Модальное окно */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
                        <Text style={styles.modalCloseText}>Закрыть</Text>
                    </TouchableOpacity>
                    <View style={styles.modalContent}>
                        {userFound && user ? (
                            <FoundUser user={user} onPress={handleSearchFriend} /> // Передаем функцию handleSearchFriend в компонент FoundUser
                        ) : (
                            <NotFoundUser />
                        )}
                    </View>
                </View>
            </Modal>
            <Text style={styles.textFriends}>Друзья</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: 'column',
        width: '90%'
    },
    contentView: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textInput: {
        width: '80%',
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#dadada',
        borderRadius: 10,
    },
    textSearchFriend: {
        fontSize: 20,
    },
    searchText: {
        fontSize: 18,
        color: '#2E66E7',
        marginTop: 10,
        textAlign: 'center',
    },
    textFriends: {
        fontSize: 40,
        marginTop: '1%'
    },
    notFoundContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    notFoundText: {
        fontSize: 18,
        color: '#5B5B5B',
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalCloseButton: {
        alignSelf: 'flex-end',
        padding: 10,
        marginRight: 10,
    },
    modalCloseText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 60,
        borderRadius: 10,
    },
});

export default UserItem;
