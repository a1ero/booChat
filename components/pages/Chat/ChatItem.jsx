import React from "react";
import { Text, View } from "react-native";
import "firebase/compat/firestore";
import firebase from 'firebase/compat/app';
import {firebaseConfig} from "../../../src/api/configFirebase";

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const ChatItem = ({ name, lastMessage }) => {
    const sendMessage = () => {
        // отправить сообщение в чат
    };

    return (
        <View style={{ padding: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>{name}</Text>
            <Text style={{ color: "gray" }}>{lastMessage}</Text>
        </View>
    );
};

const ChatList = () => {
    const [chats, setChats] = React.useState([]);

    React.useEffect(() => {
        // получить список чатов из firebase
        const unsubscribe = firebase
            .firestore()
            .collection("chats")
            .onSnapshot((querySnapshot) => {
                const chatsData = [];
                querySnapshot.forEach((doc) => {
                    const chat = doc.data();
                    chatsData.push({
                        id: doc.id,
                        name: chat.name,
                        lastMessage: chat.lastMessage,
                    });
                });
                setChats(chatsData);
            });

        return unsubscribe;
    }, []);

    return (
        <View>
            {chats.map((chat) => (
                <ChatItem
                    key={chat.id}
                    name={chat.name}
                    lastMessage={chat.lastMessage}
                />
            ))}
        </View>
    );
};

export default ChatList;
