import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Button,
    Image,
    Platform,
    Alert,
    TouchableOpacity,
    Modal,
    Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth } from "firebase/auth";
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import Login from "../Auth/Login";
import { useNavigation } from "@react-navigation/native";
import { firebaseConfig } from "../../../src/api/configFirebase";

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const HomeScreen = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth();
    const navigation = useNavigation();

    const [keyboardShown, setKeyboardShown] = useState(false);
    Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardShown(true);
    });
    Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardShown(false);
    });

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

                    // загрузить аватарку в Firestore
                    const userRef = firebase.firestore().collection('users').doc(user.uid);
                    userRef.update({ avatar: url }).then(() => {
                        console.log('Avatar updated in Firestore collection!');
                    }).catch(error => {
                        console.error('Error updating avatar in Firestore:', error);
                    });
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
        // проверить правильность текущего пароля
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        firebase.auth().currentUser.reauthenticateWithCredential(credential).then(() => {
            // обновить электронную почту, если пароль правильный
            firebase.auth().currentUser.updateEmail(newEmail).then(() => {
                console.log("Email updated successfully!");
                // обновить email в Firestore
                const userRef = firebase.firestore().collection('users').doc(user.uid);
                userRef.update({ email: newEmail }).then(() => {
                    console.log('Email updated in Firestore collection!');
                }).catch(error => {
                    console.error('Error updating email in Firestore:', error);
                });
                setShowChangeEmailModal(false);
                setShowModal(true);
            }).catch(error => {
                if (error.code === 'auth/weak-password') {
                    Alert.alert('Ошибка', 'Пароль должен состоять из 8 и более символов!');
                }
                else if (error.code === 'auth/email-already-in-use')
                    Alert.alert('Ошибка', 'Такой email уже используется!');
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
        if (newPassword.length < 8) {Alert.alert('Ошибка', 'Пароль должен состоять из 8 и более символов!');
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
        }).then(() => {
            console.log('Profile name updated!');
            setShowForm(false);
            setShowModal(true);

            // Update the name in Firestore collection 'users'
            const userRef = firebase.firestore().collection('users').doc(user.uid);
            userRef.update({ name: newName }).then(() => {
                console.log('Name updated in Firestore collection!');
            }).catch(error => {
                console.error('Error updating name in Firestore:', error);
            });
        }).catch(error => {
            console.error('Error updating profile name:', error);
        });
    };

    const handleModalClose = () => {
        setShowModal(false);
    }

    const handleLogout = () => {
        firebase.auth().signOut().then(() => {
            console.log('Signed out successfully');
            navigation.navigate('Login');
        }).catch((error) => {
            console.error(error);
        });
    }

    return (
        <TouchableWithoutFeedback onPress={() => {
            if(keyboardShown) Keyboard.dismiss();
        }}>
            <View style={styles.container}>
                {user ? (
                    <>
                    <View>
                        {avatar ? (
                            <Image source={{ uri: avatar }} style={styles.avatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.placeholderAvatarText}>{user.displayName}</Text>
                            </View>
                        )}
                        <TextInput
                            value={newAvatar}
                            onChangeText={setNewAvatar}
                        />
                        <TouchableOpacity title="Сменить аватар" onPress={handleAvatarChange}>
                            <Text style={styles.changeAvatar}>Сменить фото</Text>
                        </TouchableOpacity>
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
                                            placeholder="Введите текущий пароль"
                                            placeholderTextColor="gray"
                                            style={styles.modalInput}
                                            value={currentPassword}
                                            secureTextEntry={true}
                                            onChangeText={setCurrentPassword}
                                        />
                                        <View style={styles.modalButtons}>
                                            <TouchableOpacity title="Отменить" onPress={() => setShowChangeEmailModal(false)}>
                                                <Text style={styles.modalTextClose}>Отменить</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity title="Сохранить" onPress={handleChangeEmailSubmit}>
                                                <Text style={styles.modalTextSave}>Сохранить</Text>
                                            </TouchableOpacity>
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
                                            <TouchableOpacity title="Отменить" onPress={() => setShowChangePasswordModal(false)}>
                                                <Text style={styles.modalTextClose}>Отменить</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity title="Сохранить" onPress={handleChangePasswordSubmit}>
                                                <Text style={styles.modalTextSave}>Сохранить</Text>
                                            </TouchableOpacity>
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
                                <TouchableOpacity title="Сохранить" onPress={handleNameChange}>
                                    <Text style={styles.modalTexNameSave}>Сохранить</Text>
                                </TouchableOpacity>
                            </Modal>
                        ) : null}
                        <Modal
                            animationType="fade"
                            visible={showModal}
                            onRequestClose={handleModalClose}
                        >
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalText}>Изменения сохранены!</Text>
                                <TouchableOpacity title="OK" onPress={handleModalClose}>
                                    <Text style={styles.modalTexNameSave}>Ок</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                        <TouchableOpacity title="Сменить email" onPress={handleChangeEmail}>
                            <Text style={styles.changeData}>Сменить email</Text>
                        </TouchableOpacity>
                        <TouchableOpacity title="Сменить пароль" onPress={handleChangePassword}>
                            <Text style={styles.changeData}>Сменить пароль</Text>
                        </TouchableOpacity>
                        </View>
                        <View style={styles.logoutButtonContainer}>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <Login />
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        // top: '-10%',
        backgroundColor: '#f1f1f1',
        // backgroundColor: '#c9a2a2',
        height: '100%',
        paddingBottom: '50%',
    },
    avatarPlaceholder: {
        width: 150,
        height: 150,
        backgroundColor: '#989898',
        borderRadius: 80,
        marginBottom: 16,
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
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
    changeAvatar: {
        fontSize: 16,
        color: '#2E66E7',
        textAlign: 'center',
    },
    placeholderAvatarText: {
        fontSize: 20,
        color: '#b7b7b7',
        textAlign: 'center',
        fontWeight: 'bold',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 7
    },
    changeData: {
        fontSize: 19,
        color: '#2E66E7',
        marginTop: 10,
        textAlign: 'center',
    },
    containerTextInput: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        display: 'flex',
        textAlign: 'center',
        marginTop: '85%',
        marginLeft: 'auto',
        marginRight: 'auto',
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
    modalTextClose: {
        fontSize: 18,
        color: '#ff0000',
    },
    modalTextSave: {
        fontSize: 18,
        color: '#2E66E7',
    },
    modalTexNameSave: {
        fontSize: 18,
        color: '#2E66E7',
        textAlign: 'center',
    },
    logoutButtonContainer: {
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    logoutButton: {

    },
    logoutButtonText: {
        color: '#ff0000',
        fontSize: 18
    }
});

export default HomeScreen;
