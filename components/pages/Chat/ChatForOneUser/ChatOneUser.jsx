import React from "react";
import { StyleSheet, View } from "react-native";
import ChatUserItem from "./ChatUserItem";
import Panel from "../../../panel/Panel";

const ChatOneUser = () => {

    return (
        <View style={styles.container}>
            <ChatUserItem/>
            <Panel/>
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
