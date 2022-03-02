import React, { Component } from 'react';
import { Button, Text, TextInput, View, StyleSheet } from 'react-native';
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
                method: 'POST',
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
                    return Promise.reject(new Error(`Incorrect email or password. Status: ${  response.status}`));
                }
                if (response.status === 500){
                    return Promise.reject(new Error(`Server error. Status: ${  response.status}`));
                }
                return response.json();
            })
            .then((json) => {
                displayAlert.displayAlert('Logged in.');
                asyncStorage.storeData(json);
                this.setState({email: '', password: ''});
                nav.navigate('Home');
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
    }

    render(){
        const { navigation } = this.props;
        const { email, password } = this.state;
        return(
            <View style={styles.cont}>
                <View style={styles.centeredView}>
                    <Text style={styles.textView}>Spacebook.</Text>
                    <TextInput style={styles.textInputView} placeholder='Enter email...' onChangeText={(newEmail) => this.setState({email: newEmail})} value={email}/>
                    <TextInput style={styles.textInputView} placeholder='Enter password...' onChangeText={(newPass) => this.setState({password: newPass})} value={password}/>
                    <View style={styles.buttonOverview}>
                        <View style={styles.buttonView}> 
                            <Button title='Login' onPress={() => this.login(navigation)}/>
                        </View>
                        <View style={styles.buttonView}>
                            <Button title='Sign Up' onPress={() => navigation.navigate("SignUp")}/>
                        </View>
                    </View>
                </View>
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

const styles = StyleSheet.create({
    cont: {
        flex: 1,
        backgroundColor: '#dedede'
    },
    centeredView: {
        flex: 1,
        alignItems: 'center',
    },
    textInputView: {
        height: 50,
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        marginLeft: 40,
        marginRight: 40,
        marginBottom: 20,
        alignSelf: 'stretch',
    },
    buttonOverview: {
        flexDirection: 'row',
        width: 300,
        justifyContent: 'space-evenly'
    },
    buttonView: {
        width: 100
    },
    textView: {
        fontSize: 50,
        fontFamily: 'DejaVu Sans Mono, monospace',
        fontWeight: 'bold',
        marginTop: 100,
        marginBottom: 100
    }
})

export default LoginScreen;