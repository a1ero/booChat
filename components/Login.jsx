import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase configuration
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Login = ({ navigation }) => {
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
                console.log('Login successful!');
                navigation.navigate('Home');
            })
            .catch(error => {
                    if (error.code === 'auth/invalid-email') {
                        Alert.alert('Ошибка входа', 'Неккоректный email');
                    }
                    else if (error.code === 'auth/user-not-found'){
                        Alert.alert('Ошибка входа', 'Пользователь с таким email не существует');
                    }
                    else if (error.code === 'auth/wrong-password'){
                        Alert.alert('Ошибка входа', 'Неправильный email или пароль');
                    } else {
                        Alert.alert('Ошибка входа', error.message);
                    }
                    console.log(error.message);
                });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Image
                style={styles.logo}
                source={require('../src/images/BooChatSquare.png')}
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
                placeholder="Password"
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
                <Button
                    title="Зарегистрируйтесь"
                    onPress={() => navigation.navigate('Registration')}>
                </Button>
            </View>
            {keyboardStatus ? (
                <Text style={{ marginTop: 10 }}></Text>
            ) : null}
        </KeyboardAvoidingView>
    );
};
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        marginBottom: '5%',
        width: '33%',
        height: '33%',
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
    textReg: {
        marginTop: '5%'
    },
    text: {
        marginLeft: '3%'
    },
});

export default Login;
