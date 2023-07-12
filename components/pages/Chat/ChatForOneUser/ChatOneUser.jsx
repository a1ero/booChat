import React from "react";
import { StyleSheet, View } from "react-native";
import ChatUserItem from "./ChatUserItem";

const ChatOneUser = () => {

    return (
        <View style={styles.container}>
            <ChatUserItem/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        //alignItems: 'center',
        height: '100%',
        width : '100%',
        paddingTop: '15%'
    },
});
export default ChatOneUser;
