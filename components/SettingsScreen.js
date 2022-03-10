import React, { Component } from 'react';
import { Input, NativeBaseProvider, VStack, Button, Icon, Pressable, Center, HStack} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
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
            password: '',
            confirmPass: '',
            visible: false,
            confirmVisible: false
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

    emailIsValid() {
        const { email } = this.state;
        const myRe = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

        if (myRe.exec(email)){
            return true;
        }
        return false;
    }

    updateDetails(){
        const { data, userData, firstName, lastName, email, password, confirmPass } = this.state;
        const toSend = {};

        if (email === '' || password === '' || confirmPass === '' || firstName === '' || lastName === ''){
            displayAlert.displayAlert('Must have at least one field entered to update and must be diferent.');
        }
        else {
            if (userData.first_name !== firstName && firstName.length > 0){
                toSend.first_name = firstName;
            }
            if (userData.last_name !== lastName && lastName.length > 0){
                toSend.last_name = lastName;
            }
            if (userData.email !== email && email.length > 0 && this.emailIsValid()){
                toSend.email = email;
            } else {
                displayAlert.displayAlert('Must be a valid email');
            }

            if (password.length > 5 && password === confirmPass){
                toSend.password = password;
            } else {
                displayAlert.displayAlert('Passwords must be greater than 5 and match.');
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
        }
    }

    render() {
        const { navigation } = this.props;
        const { firstName, lastName, email, password, confirmPass, visible, confirmVisible } = this.state;
        const bgDark = "darkBlue.700";
        const inputBg = "blueGray.500";
        const textColour = "white";
        return (
            <NativeBaseProvider>
                <Center flex={1}>
                    <Center flex={1}>
                        <VStack alignItems="center" space={5} w="100%">
                            <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} w="100%" placeholder="First Name"
                                onChangeText={value => this.setState({firstName: value})} value={firstName}/>
                            <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} w="100%" placeholder="Last Name"
                                onChangeText={value => this.setState({lastName: value})} value={lastName}/>
                            <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} w="100%" placeholder="Email"
                                onChangeText={value => this.setState({email: value})} value={email}/>
                            <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} type={visible ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => this.setState({visible: !visible})}><Icon as={<MaterialIcons 
                                name={visible ? "visibility" : "visibility-off"}/>} size={5} mr="2" 
                                color={textColour}/></Pressable>} placeholder="Password"
                                onChangeText={value => this.setState({password: value})} value={password}/>
                            <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} isRequired type={confirmVisible ? "text" : "password"}
                                InputRightElement={<Pressable onPress={() => this.setState({confirmVisible: !confirmVisible})}><Icon as={<MaterialIcons 
                                name={confirmVisible ? "visibility" : "visibility-off"}/>} size={5} mr="2" 
                                color={textColour}/></Pressable>} placeholder="Confirm Password"
                                onChangeText={value => this.setState({confirmPass: value})} value={confirmPass}/>
                            <HStack w="100%" justifyContent="space-between">
                                <Button bg={bgDark} w="45%" onPress={() => navigation.navigate('Upload')}>Update Picture</Button>
                                <Button bg={bgDark} w="45%" onPress={() => this.updateDetails()}>Update</Button>
                            </HStack>
                        </VStack>
                    </Center>
                </Center>
            </NativeBaseProvider>
        );
    }
}

SettingsScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default SettingsScreen;