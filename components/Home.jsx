import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Image, Platform, Alert, TouchableOpacity, Modal, } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import 'firebase/compat/storage';
import Login from "./Login";
import {useNavigation} from "@react-navigation/native";

const firebaseConfig = {
    apiKey: "myApiKey",
    authDomain: "myAuthDomain",
    databaseURL: "myDatabaseURL",
    projectId: "myProjectId",
    storageBucket: "myStorageBucket",
    messagingSenderId: "myMessagingSenderId",
    appId: "myAppId",
    measurementId: "myMeasurementId"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth();
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(userAuth => {
            setUser(userAuth);
        });

        return () => unsubscribe();
    }, [auth]);

    const avatar = user ? user.photoURL : null;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const handleAvatarChange = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1
        });

        if (!result.canceled) {
           await uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();
            const ref = firebase.storage().ref().child(`avatars/${user.uid}`);
            await ref.put(blob)
            console.log('Image uploaded successfully!');
            await ref.getDownloadURL().then((url) => {
                console.log('Image URL:', url);
                firebase.auth().currentUser.updateProfile({
                    photoURL: url
                }).then(function() {
                    setShowModal(true);
                    console.log('Profile photo updated!');
                }).catch(function(error) {
                    console.error(error);
                });
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeEmail = () => {
        setShowChangeEmailModal(true);
    }

    const handleChangeEmailSubmit = () => {
        if (newEmail.trim() === "") {
            Alert.alert("Ошибка", "Email не может быть пустым!");
            return;
        }

        // check if current password is correct
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        firebase.auth().currentUser.reauthenticateWithCredential(credential).then(() => {
            // update email if password is correct
            firebase.auth().currentUser.updateEmail(newEmail).then(() => {
                console.log("Email updated successfully!");
                setShowChangeEmailModal(false);
                setShowModal(true);
            }).catch(error => {
                if (error.code === 'auth/weak-password') {
                    Alert.alert('Ошибка', 'Пароль должен состоять из 8 и более символов!');
                }
                console.log(error.message);
            });
        }).catch(error => {
            console.log(error.message);
            if (error.code === 'auth/wrong-password') {
                Alert.alert('Ошибка', 'Неверный текущий пароль!');
            }
        });
    };

    const handleChangePassword = () => {
        setShowChangePasswordModal(true);
    }

    const handleChangePasswordSubmit = () => {
        if (newPassword.trim() === '') {
            Alert.alert('Ошибка', 'Пароль не может быть пустым!');
            return;
        }

        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        firebase.auth().currentUser.reauthenticateWithCredential(credential).then(() => {
            firebase.auth().currentUser.updatePassword(newPassword).then(() => {
                console.log('Password updated successfully!');
                setShowChangePasswordModal(false);
                setShowModal(true);
            }).catch(error => {
                if (error.code === 'auth/weak-password') {
                    Alert.alert('Ошибка', 'Пароль должен состоять из 8 и более символов!');
                }
                console.log(error.message);
            });
        }).catch(error => {
            console.log(error.message);
            if (error.code === 'auth/wrong-password') {
                Alert.alert('Ошибка', 'Неверный текущий пароль!');
            }
        });
    };

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Ошибка', 'Нет доступа к галерее');
                }
            }
        })();
    }, []);

    const handleNameChange = () => {
        if (newName.trim() === '') {
            Alert.alert('Ошибка', 'Имя не может быть пустым!');
            return;
        }
        firebase.auth().currentUser.updateProfile({
            displayName: newName
        }).then(function() {
            console.log('Profile name updated!');
            setShowForm(false);
            setShowModal(true);
        }).catch(function(error) {
            console.error(error);
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
    }

    const handleLogout = () => {
        firebase.auth().signOut().then(() => {
            console.log('Signed out successfully');
            navigation.navigate("Login");
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <View style={styles.container}>
            {user ? (
                <>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder} />
                    )}
                    <TextInput
                        value={newAvatar}
                        onChangeText={setNewAvatar}
                        placeholder={user.displayName}
                    />
                    <Button title="Сменить аватар" onPress={handleAvatarChange}/>
                    <View style = {styles.containerText}>
                        <Text style={styles.text}>{user.displayName}</Text>
                        <TouchableOpacity  onPress={() => setShowForm(true)}>
                            <Text style={styles.changeText}>Сменить Имя</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.containerEmail}>
                        <Text style={styles.textEmail}>{user.email}</Text>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showChangeEmailModal}
                            onRequestClose={() => setShowChangeEmailModal(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Сменить Email</Text>
                                    <TextInput
                                        placeholder="Ваш новый email"
                                        placeholderTextColor="gray"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        style={styles.modalInput}
                                        onChangeText={(text) => setNewEmail(text)}
                                    />
                                    <TextInput
                                        placeholder="Введите новый пароль"
                                        placeholderTextColor="gray"
                                        style={styles.modalInput}
                                        value={currentPassword}
                                        secureTextEntry={true}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <View style={styles.modalButtons}>
                                        <Button title="Отменить" onPress={() => setShowChangeEmailModal(false)} />
                                        <Button title="Сохранить" onPress={handleChangeEmailSubmit} />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={showChangePasswordModal}
                            onRequestClose={() => setShowChangePasswordModal(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Сменить пароль</Text>
                                    <TextInput
                                        placeholder="Введите текущий пароль"
                                        placeholderTextColor="gray"
                                        style={styles.modalInput}
                                        value={currentPassword}
                                        secureTextEntry={true}
                                        onChangeText={setCurrentPassword}
                                    />
                                    <TextInput
                                        placeholder="Введите новый пароль"
                                        placeholderTextColor="gray"
                                        secureTextEntry={true}
                                        style={styles.modalInput}
                                        onChangeText={(text) => setNewPassword(text)}
                                    />
                                    <View style={styles.modalButtons}>
                                        <Button title="Отменить" onPress={() => setShowChangePasswordModal(false)} />
                                        <Button title="Сохранить" onPress={handleChangePasswordSubmit} />
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    </View>
                    {showForm ? (
                        <Modal
                            animationType="slide"
                            onRequestClose={handleModalClose}
                            style={styles.containerTextInput}>
                            <TextInput
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="Введите новое имя"
                                placeholderTextColor="gray"
                                style={styles.input}
                            />
                            <Button title="Сохранить" onPress={handleNameChange}></Button>
                        </Modal>
                    ) : null}
                    <Modal
                        animationType="fade"
                        visible={showModal}
                        onRequestClose={handleModalClose}
                    >
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalText}>Изменения сохранены!</Text>
                            <Button title="OK" onPress={handleModalClose}/>
                        </View>
                    </Modal>
                    <Button title="Сменить email" onPress={handleChangeEmail} />
                    <Button title="Сменить пароль" onPress={handleChangePassword} />
                    <Button title="Выйти из аккаунта" onPress={handleLogout} color="#FF0000" />
                </>
            ) : (
                <Login />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f1f1'
    },
    avatarPlaceholder: {
        width: 150,
        height: 150,
        backgroundColor: '#989898',
        borderRadius: 80,
        marginBottom: 16,
        marginTop: 20
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 80,
        marginBottom: 16,
        marginTop: 20
    },
    containerText: {
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        alignItems: 'center',
        backgroundColor: '#dadada',
        width: 300,
        padding: 5,
        borderRadius: 10,
        marginTop: 15,
        height : 40
    },
    text: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 16
    },
    changeText: {
        fontSize: 14,
        color: '#2E66E7',
        marginLeft: '66%'
    },
    containerTextInput: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        display: 'flex',
        textAlign: 'center',
        marginTop: '100%',
        marginLeft: '10%',
        marginBottom: 15,
        width : 300,
        height: 50,
        fontSize: 24,
        color: 'black',
        fontWeight: 'bold',
        borderRadius: 10,
        borderStyle: 'solid',
        borderColor: 'black',
        borderWidth: 1
    },
    containerEmail: {
        backgroundColor: '#dadada',
        marginTop: 16,
        marginBottom: 16,
        width: 300,
        borderRadius: 10,
        padding: 10
    },
    textEmail: {
        textAlign: 'center',
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        width: '90%',
        borderRadius: 10,
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
    },
    modalTitle: {
        fontSize : 24,
        fontWeight : 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginVertical: 8,
    },
    modalText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16
    },
});

export default HomeScreen;
