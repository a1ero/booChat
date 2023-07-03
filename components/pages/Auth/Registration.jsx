import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import firebase from "firebase/compat/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { firebaseConfig } from "../../../src/api/configFirebase";
import 'firebase/compat/firestore';

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const Registration = ({ navigation }) => {
    const auth = getAuth();
    const db = firebase.firestore();
    const [keyboardShown, setKeyboardShown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [keyboardStatus, setKeyboardStatus] = useState(undefined);
    const [resendTimer, setResendTimer] = useState(59); // Установка начального значения таймера
    const [showResendButton, setShowResendButton] = useState(false);
    const [isRegistrationDisabled, setIsRegistrationDisabled] = useState(false);

    // Слушать события клавиатуры, чтобы настроить раскладку
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardStatus('Keyboard Shown');
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardStatus('Keyboard Hidden');
            }
        );
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    // Обработка регистрации пользователей
    const handleRegistration = () => {
        if (password.length < 8) {
            Alert.alert('Ошибка', 'Пароль должен состоять из 8 и более символов!');
            return;
        }
        setIsLoading(true);
        setIsRegistrationDisabled(true);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Отправить код подтверждения по электронной почте
                const user = userCredential.user;
                sendEmailVerification(user).then(() => {
                    Alert.alert(
                        'Регистрация',
                        'Письмо с кодом подтверждения было отправлено на вашу почту. Подтвердите регистрацию, перейдя по ссылке из письма. Если письма нет, проверьте папку Спам'
                    );
                    console.log('Email verification email sent');
                    setShowResendButton(true);
                    setResendTimer(59); // Сброс таймера при отправке повторного письма
                }).catch((error) => {
                    console.error("Ошибка при отправке письма с кодом подтверждения", error);
                }).finally(() => {
                    setIsLoading(false);
                });

                /// Добавить пользователя в коллекцию "users"
                db.collection("users").doc(user.uid).set({
                    email: user.email,
                    // Дополнительные поля или данные, которые вы хотите сохранить в коллекции "users"
                })
                    .then(() => {
                        console.log("Пользователь добавлен в коллекцию 'users'");
                    })
                    .catch((error) => {
                        console.error("Ошибка при добавлении пользователя в коллекцию 'users'", error);
                    });

                // Добавить коллекцию "friends" для нового пользователя
                db.collection("users").doc(user.uid).collection("friends").add({
                    // Дополнительные поля или данные, которые вы хотите сохранить в коллекции "friends"
                })
                    .then((docRef) => {
                        console.log("Коллекция 'friends' создана для пользователя", user.uid);
                    })
                    .catch((error) => {
                        console.error("Ошибка при создании коллекции 'friends' для пользователя", user.uid, error);
                    });

                // navigation.navigate("Login");
            })
            .catch((error) => {
                setIsLoading(false);
                setIsRegistrationDisabled(false);
                if (error.code === 'auth/email-already-in-use') {
                    Alert.alert(
                        'Ошибка регистрации',
                        'Пользователь с таким email уже существует!'
                    );
                } else if (error.code === 'auth/invalid-email') {
                    Alert.alert('Ошибка регистрации', 'Некорректный email');
                }
                console.log(error.message);
            });
    };

    const handleResendVerification = () => {
        const user = auth.currentUser;
        if (user) {
            user.sendEmailVerification().then(() => {
                Alert.alert(
                    'Повторная отправка',
                    'Письмо с кодом подтверждения было повторно отправлено на вашу почту. Проверьте папку СПАМ, если письма нет.'
                );
                console.log('Email verification email resent');
                setShowResendButton(false);
                setResendTimer(59); // Сброс таймера при повторной отправке
            }).catch((error) => {
                console.error("Ошибка при повторной отправке письма с кодом подтверждения", error);
            });
        }
    };

    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

    // В значение таймера отображаются ведущие нули
    const formattedTimer = `${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(resendTimer % 60).padStart(2, '0')}`;

    return (
        <TouchableWithoutFeedback onPress={() => {
            if (keyboardShown) Keyboard.dismiss();
        }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Image
                    style={styles.logo}
                    source={require('../../../src/images/BooChatSquare.png')}
                />
                <Text style={styles.header}>Регистрация</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity
                    style={[styles.buttonReg, isLoading || isRegistrationDisabled ? styles.buttonDisabled : null]}
                    onPress={handleRegistration}
                    disabled={isLoading || isRegistrationDisabled}
                >
                    {isLoading ? (
                        <Text style={styles.regText}>Загрузка...</Text>
                    ) : (
                        <Text style={styles.regText}>Зарегистрироваться</Text>
                    )}
                </TouchableOpacity>
                {showResendButton ? (
                    resendTimer > 0 ? (
                        <TouchableOpacity style={styles.resendButton} onPress={handleResendVerification} disabled>
                            <Text style={styles.resendButtonText}>
                                Отправить повторно {formattedTimer}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.resendButton} onPress={handleResendVerification}>
                            <Text style={styles.resendButtonText}>Отправить повторно</Text>
                        </TouchableOpacity>
                    )
                ) : null}
                <View style={styles.textLog}>
                    <Text>Уже зарегистрированы? </Text>
                    <TouchableOpacity
                        title={'Войдите'}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.regBtnText}>Войти</Text>
                    </TouchableOpacity>
                </View>
                {keyboardStatus ? (
                    <Text style={{ marginTop: 10 }}></Text>
                ) : null}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
    },
    logo: {
        marginBottom: '5%',
        width: 110,
        height: 160,
    },
    header: {
        fontSize: 24,
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        height: 40,
        width: '80%',
        marginBottom: 16,
    },
    buttonReg: {
        padding: 13,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#018bd3',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.7,
    },
    regBtnText: {
        color: '#ff0000',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 10,
    },
    regText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
    },
    textLog: {
        marginTop: '5%'
    },
    resendButton: {
        marginTop: 10,
    },
    resendButtonText: {
        color: '#018bd3',
        textAlign: 'center',
        fontSize: 16,
    },
});

export default Registration;
