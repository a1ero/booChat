import React from 'react';
import { View, StyleSheet } from 'react-native';
import Home from "./Home";
import Panel from "../../panel/Panel";

const Main = () => {
    return (
        <View style={styles.main}>
            <Home/>
            <Panel/>
        </View>

    );
};

const styles = StyleSheet.create({
    main: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width : '100%',
        //backgroundColor: 'rgb(0,0,0)',
    },
});

export default Main;
