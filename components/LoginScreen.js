import React, { Component } from 'react';
import { Button, TextInput, View } from 'react-native';
import { PropTypes } from 'prop-types';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class LoginScreen extends Component {
    constructor(props){
        super(props);

        this.state={
            email: 'gp@gp.com',
            password: 'password',
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

    login(nav) {
        const { email, password } = this.state;
        if (email === '' || password === ''){
            displayAlert.displayAlert('All fields must be entered.');

        }
        else if (!this.emailIsValid()){
            displayAlert.displayAlert('Invalid email.');
        }
        else {
            fetch('http://localhost:3333/api/1.0.0/login', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            })
            .then((response) => {
                if (response.status === 400){
                    displayAlert.displayAlert('Incorrect email or password.');
                    return Promise.reject(new Error(`Incorrect email or password. Status: ${  response.status}`));
                }
                if (response.status === 500){
                    displayAlert.displayAlert('Server error.');
                    return Promise.reject(new Error(`Server error. Status: ${  response.status}`));
                }
                return response.json();
            })
            .then((json) => {
                if (json === {}){
                    console.log("hm");
                }
                displayAlert.displayAlert('Logged in.');
                asyncStorage.storeData(json);
                this.setState({email: '', password: ''});
                nav.navigate('Home');
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    render(){
        const { navigation } = this.props;
        const { email, password } = this.state;
        return(
            <View>
                <TextInput placeholder='Enter email...' onChangeText={this.handleEmailInput} value={email}/>
                <TextInput placeholder='Enter password...' onChangeText={this.handlePasswordInput} value={password}/>
                <Button title='Login' onPress={() => this.login(navigation)}/>
                <Button title='Sign Up' onPress={() => navigation.navigate("SignUp")}/>
            </View>
        )
    }
}

LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default LoginScreen;