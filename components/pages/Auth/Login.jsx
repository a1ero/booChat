import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, } from 'react-native';
import firebase from "firebase/compat/app";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from "../../../src/api/configFirebase";

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const Login = ({ navigation }) => {
    const auth = getAuth();
    const [keyboardShown, setKeyboardShown] = useState(false);
    Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardShown(true);
    });
    Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardShown(false);
    });

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [keyboardStatus, setKeyboardStatus] = useState(undefined);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardStatus('Keyboard Shown');
            });
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardStatus('Keyboard Hidden');
            });

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, login, password)
            .then(userCredential => {
                const user = userCredential.user;
                if (user.emailVerified) {
                    console.log('Login successful!');
                    navigation.navigate('Main');
                } else {
                    Alert.alert('Ошибка', 'Email не подтвержден!');
                    setLogin('');
                    setPassword('');
                }
            })
            .catch(error => {
                if (error.code === 'auth/invalid-email') {
                    Alert.alert('Ошибка входа', 'Неккоректный email');
                }
                else if (error.code === 'auth/user-not-found') {
                    Alert.alert('Ошибка входа', 'Пользователь с таким email не существует');
                }
                else if (error.code === 'auth/wrong-password') {
                    Alert.alert('Ошибка входа', 'Неправильный email или пароль');
                } else {
                    Alert.alert('Ошибка входа', error.message);
                }
                console.log(error.message);
            });
    };

    return (
        <TouchableWithoutFeedback onPress={() => {
            if(keyboardShown) Keyboard.dismiss();
        }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <Image
                    style={styles.logo}
                    source={require('../../../src/images/BooChatSquare.png')}
                />
                <Text style={styles.header}>Вход</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={login}
                    onChangeText={text => setLogin(text)}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={text => setPassword(text)}
                />
                <TouchableOpacity
                    title="Login"
                    onPress={handleLogin}
                    style={styles.buttonLogin}
                    underlayColor='#fff'>
                    <Text style={styles.loginText}>Войти</Text>
                </TouchableOpacity>
                <View style={styles.textReg}>
                    <Text style={styles.text} >Если еще нет аккаунта</Text>
                    <TouchableOpacity
                        title="Зарегистрируйтесь"
                        onPress={() => navigation.navigate('Registration')}>
                        <Text style={styles.regBtn}>Зарегистрируйтесь</Text>
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
    },
    logo: {
        marginBottom: '5%',
        width: '40%',
        height: '18%',
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
        width: '80%',
        marginBottom: 16,
    },
    buttonLogin: {
        padding: 13,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#0098e8',
    },
    loginText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
    },
    regBtn: {
        color: '#ff0000',
        textAlign: 'center',
        fontSize: 20,
        marginTop: 10,
    },
    textReg: {
        marginTop: '5%'
    },
    text: {
        marginLeft: '3%'
    },
});

export default Login;
