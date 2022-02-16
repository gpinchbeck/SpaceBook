import React, { Component } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

class LoginScreen extends Component {
    constructor(props){
        super(props);

        this.state={
            email: '',
            password: ''
        }
    }

    handleEmailInput = (email) => {
        this.setState({email: email});
    }

    handlePasswordInput = (password) => {
        this.setState({password: password});
    }

    login = () => {
        console.log("Login");
    }

    render(){
        const nav = this.props.navigation;
        return(
            <View>
                <TextInput placeholder='Enter email...' onChangeText={this.handleEmailInput} value={this.state.email}/>
                <TextInput placeholder='Enter password...' onChangeText={this.handlePasswordInput} value={this.state.password}/>
                <Button title='Login' onPress={() => this.login()}/>
                <Button title='Sign Up' onPress={() => nav.navigate("SignUp")}/>
            </View>
        )
    }
}

export default LoginScreen;