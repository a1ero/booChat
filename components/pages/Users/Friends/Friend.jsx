import React from "react";
import {StyleSheet, View} from "react-native";
import FriendList from "./FriendList";
import Panel from "../../../panel/Panel";

const Friend = () => {

    return (
        <View style={styles.container}>
            <FriendList/>
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
    },
});

export default Friend;
