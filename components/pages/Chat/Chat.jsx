import React from "react";
import {StyleSheet, Text, View} from "react-native";
import ChatItem from "./ChatItem";
import Panel from "../../panel/Panel";

const Chat = () => {

    return(
        <View style={styles.container}>
            <ChatItem/>
            <Panel/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width : '100%',
    },
});
export default Chat;
