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
                    return Promise.reject(new Error(`User already created. Status: ${  response.status}`));
                }
                if (response.status === 500){
                    return Promise.reject(new Error(`Server error. Status: ${  response.status}`));
                }
                return displayAlert.displayAlert('User created.');
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
    }

    render(){
        const { firstName, lastName, email, password } = this.state;
        return(
            <View>
                <TextInput placeholder='First name...' onChangeText={value => {this.setState({firstName: value})}} value={firstName}/>
                <TextInput placeholder='Last name...' onChangeText={value => {this.setState({lastName: value})}} value={lastName}/>
                <TextInput placeholder='Email...' onChangeText={value => this.setState({email: value})} value={email}/>
                <TextInput placeholder='Password...' onChangeText={value => this.setState({password: value})} value={password}/>
                <Button title='Sign Up' onPress={() => {this.signup()}}/>
            </View>
        )
    }
}

export default SignUpScreen;