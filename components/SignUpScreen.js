import React, { Component } from 'react';
import { Alert, Button, Platform, Text, TextInput, View } from 'react-native';

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

    displayAlert(msg) {
        if (Platform.OS == 'web'){
            alert(msg);
        }
        else{
            Alert.alert(msg);
        }
    }

    emailIsValid(email) {
        const myRe = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (myRe.exec(email)){
            return true;
        }
        return false;
    }

    signup() {
        if (this.state.email == '' || this.state.password == '' || this.state.first_name == '' || this.state.last_name == ''){
            this.displayAlert('All fields must be entered.');
        }
        else if (!this.emailIsValid(this.state.email)){
            this.displayAlert('Invalid email.');
        }
        else if (this.state.password.length <= 5){
            this.displayAlert('Password must be at least 6 characters');
        }
        else {
            return fetch('http://localhost:3333/api/1.0.0/user', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: this.state.first_name,
                    last_name: this.state.last_name,
                    email: this.state.email,
                    password: this.state.password
                })
            })
            .then((response) => {
                if (response.status == 400){
                    this.displayAlert('User already created');
                    return Promise.reject('Bad request. Status: ' + response.status);
                }
                else if (response.status == 500){
                    this.displayAlert('Server error.');
                    return Promise.reject('Server error. Status: ' + response.status);
                }
                else {
                    this.displayAlert('User created.');
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
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