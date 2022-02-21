import React, { Component } from "react";
import { Button, Text, View } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const getData = async (done) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@spacebook_details');
        const data = JSON.parse(jsonValue);
        return done(data);
    } catch (e) {
        console.log(e);
    }
};

class HomeScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login_info: {}
        };
    }

    componentDidMount() {
        getData((data) => {
            this.setState({
                login_info: data
            });
        });
    }

    logout(nav) {
        nav.navigate('Login');
    }

    render() {
        const nav = this.props.navigation;
        return (
            <View>
                <Text>Home Screen</Text>
                <Text>Login id: {this.state.login_info.id}</Text>
                <Text>Login token: {this.state.login_info.token}</Text>
                <Button title="Logout" onPress={() => this.logout(nav)}/>
            </View>
        );
    }
}

export default HomeScreen;