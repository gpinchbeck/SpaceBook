import React, { Component } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

class SignUpScreen extends Component {
    constructor(props){
        super(props);

        this.state={
            first_name: '',
            last_name: '',
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

    signup = () => {
        console.log("Sign Up");
    }

    render(){
        return(
            <View>
                <TextInput placeholder='First name...' onChangeText={value => {this.setState({first_name: value})}} value={this.state.first_name}/>
                <TextInput placeholder='Last name...' onChangeText={value => {this.setState({last_name: value})}} value={this.state.last_name}/>
                <TextInput placeholder='Email...' onChangeText={this.handleEmailInput} value={this.state.email}/>
                <TextInput placeholder='Password...' onChangeText={this.handlePasswordInput} value={this.state.password}/>
                <Button title='Sign Up' onPress={() => {this.signup()}}/>
            </View>
        )
    }
}

export default SignUpScreen;