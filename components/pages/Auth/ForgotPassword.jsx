import React, { useState } from "react";
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import firebase from "firebase/compat/app";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { firebaseConfig } from "../../../src/api/configFirebase";
import 'firebase/compat/firestore';

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const ForgotPassword = ({navigation}) => {
    const auth = getAuth();
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);

    const [keyboardShown, setKeyboardShown] = useState(false);
    Keyboard.addListener("keyboardDidShow", () => {
        setKeyboardShown(true);
    });
    Keyboard.addListener("keyboardDidHide", () => {
        setKeyboardShown(false);
    });

    const handlePasswordRecovery = () => {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setIsEmailSent(true);
                console.log('Mail was send')
            })
            .catch(error => {
                if (error.code === 'auth/user-not-found') {
                    Alert.alert('Ошибка', 'Пользователь с таким email не существует');
                }
                else if (error.code === 'auth/missing-email') {
                    Alert.alert('Ошибка', 'Email не может быть пустым');
                }
                else if (error.code === 'auth/invalid-email') {
                    Alert.alert('Ошибка', 'Неверный формат Email');
                }
                console.log(error.message);
            });
    };

    return (
        <TouchableWithoutFeedback onPress={() => {
            if(keyboardShown) Keyboard.dismiss();
        }}>
            <View style={styles.container}>
                {!isEmailSent ? (
                    <>
                        <Text style={styles.header}>Восстановление пароля</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={handlePasswordRecovery}>
                            <Text style={styles.buttonText}>Отправить инструкции</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.buttonTextBack}>Назад</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.header}>Письмо отправлено</Text>
                        <Text style={styles.message}>
                            Письмо с инструкциями по восстановлению пароля было отправлено на ваш email.
                        </Text>
                        <TouchableOpacity onPress={() => setIsEmailSent(false)}>
                            <Text style={styles.buttonText}>Вернуться</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        fontSize: 24,
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 4,
        padding: 8,
        height: 40,
        width: "80%",
        marginBottom: 16,
    },
    button: {
        padding: 13,
        height: 50,
        borderRadius: 10,
        backgroundColor: "#018bd3",
        justifyContent: "center",
        alignItems: "center",
        width: "80%",
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 20,
    },
    message: {
        marginBottom: 24,
        textAlign: "center",
    },
    buttonTextBack: {
        color: 'red',
        fontSize: 18,
        marginTop: 30
    }
});

export default ForgotPassword;
