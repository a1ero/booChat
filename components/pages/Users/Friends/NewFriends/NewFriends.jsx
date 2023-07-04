import React from "react";
import  {StyleSheet, Text, View } from "react-native";
import NewFriendsList from "./NewFriendsList";
import Panel from "../../../../panel/Panel";

const NewFriends = () => {

    return(
        <View style={styles.container}>
            <NewFriendsList/>
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
export default NewFriends;
