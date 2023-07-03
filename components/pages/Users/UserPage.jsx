import React from "react";
import {StyleSheet, Text, View} from "react-native";
import UserItem from "./UserItem";
import Panel from "../../panel/Panel";

const UserPage = () => {

    return (
        <View style={styles.container}>
            <UserItem/>
            <Panel/>
        </View>
    )
};

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
export default UserPage;
