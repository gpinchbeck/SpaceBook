import React, { Component } from 'react';
import { View, TextInput, Button } from 'react-native';
import PropTypes from 'prop-types';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class SettingsScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            userData: {},
            firstName: '',
            lastName: '',
            email: '',
            password: ''
        }
    }

    componentDidMount(){
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getUserData();
        });
    }

    getUserData(){
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }`, {
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            }
            return response.json();
        })
        .then((responseJson) => {
            this.setState({
                userData: responseJson,
            });
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    updateDetails(){
        const { data, userData, firstName, lastName, email, password } = this.state;
        const toSend = {};

        if (userData.first_name !== firstName && firstName.length > 0){
            toSend.first_name = firstName;
        }
        if (userData.last_name !== lastName && lastName.length > 0){
            toSend.last_name = lastName;
        }
        if (userData.email !== email && email.length > 0){
            toSend.email = email;
        }
        if (password.length > 5){
            toSend.password = password;
        }

        if (Object.keys(toSend).length > 0) {
            fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Authorization': data.token,
                },
                body: JSON.stringify(toSend)
            })
            .then((response) => {
                if (response.status === 400){
                    return Promise.reject(new Error(`Bad request. Status: ${  response.status}`));
                }
                if (response.status === 401){
                    return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
                }
                if (response.status === 403){
                    return Promise.reject(new Error(`Forbidden. Status: ${  response.status}`));
                }
                if (response.status === 404){
                    return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
                }
                if (response.status === 500){
                    return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
                } 
                return displayAlert.displayAlert('Details updated');
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
        else {
            displayAlert.displayAlert('Must have at least one field entered to update and must be diferent.')
        }
    }

    render() {
        const { navigation } = this.props;
        const { firstName, lastName, email, password } = this.state;
        return(
            <View>
                <View>
                    <TextInput placeholder='Change first name' onChangeText={(newFirstName) => this.setState({firstName: newFirstName})} value={firstName}/>
                    <TextInput placeholder='Change last name' onChangeText={(newLastName) => this.setState({lastName: newLastName})} value={lastName}/>
                    <TextInput placeholder='Change email' onChangeText={(newEmail) => this.setState({email: newEmail})} value={email}/>
                    <TextInput placeholder='Change password' onChangeText={(newPassword) => this.setState({password: newPassword})} value={password}/>
                    <Button title='Update details' onPress={() => this.updateDetails()}/>
                </View>
                <View>
                    <Button title='Update picture' onPress={() => navigation.navigate('Upload')}/>
                </View>
            </View>
        )
    }
}

SettingsScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default SettingsScreen;