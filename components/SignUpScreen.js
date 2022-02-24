import React, { Component } from 'react';
import { Button, TextInput, View } from 'react-native';

import DisplayAlert from './DisplayAlert';

const displayAlert = new DisplayAlert();

class SignUpScreen extends Component {
    constructor(props){
        super(props);

        this.state={
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        }
    }

    handleEmailInput = (email) => {
        this.setState({email});
    }

    handlePasswordInput = (password) => {
        this.setState({password});
    }

    emailIsValid() {
        const { email } = this.state;
        const myRe = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (myRe.exec(email)){
            return true;
        }
        return false;
    }

    signup() {
        const { email, password, firstName, lastName} = this.state;
        if (email === '' || password === '' || firstName === '' || lastName === ''){
            displayAlert.displayAlert('All fields must be entered.');
        }
        else if (!this.emailIsValid(email)){
            displayAlert.displayAlert('Invalid email.');
        }
        else if (password.length <= 5){
            displayAlert.displayAlert('Password must be at least 6 characters');
        }
        else {
            fetch('http://localhost:3333/api/1.0.0/user', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password
                })
            })
            .then((response) => {
                if (response.status === 400){
                    displayAlert.displayAlert('User already created');
                    Promise.reject(new Error(`Bad request. Status: ${  response.status}`));
                }
                if (response.status === 500){
                    displayAlert.displayAlert('Server error.');
                    Promise.reject(new Error(`Server error. Status: ${  response.status}`));
                }
                
                    displayAlert.displayAlert('User created.');
                
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    render(){
        const { firstName, lastName, email, password } = this.state;
        return(
            <View>
                <TextInput placeholder='First name...' onChangeText={value => {this.setState({firstName: value})}} value={firstName}/>
                <TextInput placeholder='Last name...' onChangeText={value => {this.setState({lastName: value})}} value={lastName}/>
                <TextInput placeholder='Email...' onChangeText={this.handleEmailInput} value={email}/>
                <TextInput placeholder='Password...' onChangeText={this.handlePasswordInput} value={password}/>
                <Button title='Sign Up' onPress={() => {this.signup()}}/>
            </View>
        )
    }
}

export default SignUpScreen;