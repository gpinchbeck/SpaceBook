import React, { Component } from 'react';
import { Alert, Button, Platform, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem('@spacebook_details', jsonValue);
    } catch (e) {
        console.error(e);
    }
};

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

    login(nav) {

        if (this.state.email == '' || this.state.password == ''){
            this.displayAlert('All fields must be entered.');
        }
        else if (!this.emailIsValid(this.state.email)){
            this.displayAlert('Invalid email.');
        }
        else {
            fetch('http://localhost:3333/api/1.0.0/login', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.email,
                    password: this.state.password
                })
            })
            .then((response) => {
                if (response.status == 400){
                    this.displayAlert('Incorrect email or password.');
                    return Promise.reject('Incorrect email or password. Status: ' + response.status);
                }
                if (response.status == 500){
                    this.displayAlert('Server error.');
                    return Promise.reject('Server error. Status: ' + response.status);
                }
                return response.json();
            })
            .then((json) => {
                if (json == {}){
                    console.log("hm");
                }
                this.displayAlert('Logged in.');
                storeData(json);
                nav.navigate('Home');
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    render(){
        const nav = this.props.navigation;
        return(
            <View>
                <TextInput placeholder='Enter email...' onChangeText={this.handleEmailInput} value={this.state.email}/>
                <TextInput placeholder='Enter password...' onChangeText={this.handlePasswordInput} value={this.state.password}/>
                <Button title='Login' onPress={() => this.login(nav)}/>
                <Button title='Sign Up' onPress={() => nav.navigate("SignUp")}/>
            </View>
        )
    }
}

export default LoginScreen;