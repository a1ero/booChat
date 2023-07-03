import React from "react";
import {View, Text, Image, Button, StyleSheet, TouchableOpacity} from "react-native";

const FoundUser = ({ user }) => {
    const handleAddFriend = () => {
        // Действия при добавлении пользователя в друзья
    };

    return (
        <View style={styles.container}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style = {styles.textName}>{user.name}</Text>
            <TouchableOpacity title="Добавить в друзья" onPress={handleAddFriend}>
                <Text style={styles.textAddFriend}>Добавить в друзья</Text>
            </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 80,
        marginBottom: 16,
        marginTop: 20,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    textName: {
      fontSize: 25
    },
    textAddFriend: {
        fontSize: 18,
        color: '#2E66E7',
        marginTop: 20,
        textAlign: 'center',
    },
});
export default FoundUser;
