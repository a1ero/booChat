import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Keyboard, Button, } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import {useNavigation} from "@react-navigation/native";

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

const Registration = ({ navigation }) => {
    const [email, setEmail] = useState('');
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

    const handleRegistration = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                Alert.alert('Успешная регистрация!');
                console.log('Registration successful!');
                navigation.navigate("Login");
            })
            .catch((error) => {
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

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Image
                style={styles.logo}
                source={require('../src/images/BooChatSquare.png')}
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
                placeholder="Password"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={(text) => setPassword(text)}
            />
            <TouchableOpacity style={styles.buttonReg} onPress={handleRegistration}>
                <Text style={styles.regText}>Зарегистрироваться</Text>
            </TouchableOpacity>
            <View style={styles.textLog}>
                <Text >Уже зарегистрированы? </Text>
                <Button
                    title={'Войдите'}
                    onPress={() => navigation.navigate('Login')}
                />
            </View>

            {keyboardStatus ? (
                <Text style={{ marginTop: 10 }}></Text>
            ) : null}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        display: "flex",
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
    buttonReg: {
        padding: 13,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#018bd3',
    },
    regText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 20,
    },
    textLog: {
        marginTop: '5%'
    }
});

export default Registration;
