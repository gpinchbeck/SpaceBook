import React, { Component } from 'react';
import { View, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import DisplayAlert from './DisplayAlert';


const getData = async (done) => {
    try {
        const jsonValue = await AsyncStorage.getItem('@spacebook_details');
        const data = JSON.parse(jsonValue);
        return done(data);
    } catch (e) {
        console.log(e);
    }
    return null;
};

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
        getData((data) => {
            this.setState({
                data
            });
            this.getUserData();
        });
    }

    async getUserData() {
        const { data } = this.state;
        const response = await fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }`, {
            method: 'get',
            headers: {
                'X-Authorization': data.token,
            },
        });
        const result = await response.json();
        this.setState({
            userData: result,
        });
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
                if (response.status === 200){
                    displayAlert.displayAlert('Details updated');
                }
                else {
                    displayAlert.displayAlert(response.statusText);
                }
            })
            .catch((error) => {
                console.log(error);
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