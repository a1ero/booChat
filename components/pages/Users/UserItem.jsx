import React, { useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    Alert,
    Keyboard,
    TouchableWithoutFeedback, Image
} from "react-native";
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebase from "firebase/compat/app";
import { firebaseConfig } from "../../../src/api/configFirebase";

import FoundUser from "../Users/StatusSearchUser/FoundUser";
import Line from "../../component/Line";
import {useNavigation} from "@react-navigation/native";
import Friend from "./Friends/Friend";


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
    const navigation = useNavigation();

    const [keyboardShown, setKeyboardShown] = useState(false);
    Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardShown(true);
    });
    Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardShown(false);
    });

    const handleSearchFriend = ({navigation}) => {
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
                setSearched(true); // Устанавливаю состояние, что поиск выполнен
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
        <TouchableWithoutFeedback onPress={() => {
            if(keyboardShown) Keyboard.dismiss();
        }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.textSearchFriend}>Найти друга</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('NewFriends')}>
                        <Image
                            style={styles.newFriend}
                            source={require('../../../src/icon/NewFriends/newFriendsIcon.png')}
                        />
                    </TouchableOpacity>
                </View>
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
                                <FoundUser user={user} onPress={handleSearchFriend} /> // Передаю функцию handleSearchFriend в компонент FoundUser
                            ) : (
                                <></>
                            )}
                        </View>
                    </View>
                </Modal>
                <Text style={styles.textFriends}>Друзья</Text>
                <Line/>
                <Friend/>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: 'column',
        width: '90%'
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    newFriend: {
        height:25,
        width: 28,
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
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
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
        marginLeft: 15,
        textAlign: 'center',
    },
    textFriends: {
        fontSize: 35,
        marginTop: '1%',
        marginBottom: 10
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
