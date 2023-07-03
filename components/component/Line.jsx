import React from "react";
import { View, StyleSheet } from "react-native";

const Line = () => {

    return(
        <View style = {styles.line}></View>
    )
}

const styles = StyleSheet.create({
    line: {
        height: 1,
        backgroundColor: "#C8C8C8",
    },
})
export default Line;
