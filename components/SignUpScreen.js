import React, { Component } from 'react';
import { Box, Input, NativeBaseProvider, VStack, Button, Icon, Pressable, Center, HStack } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';

import DisplayAlert from './DisplayAlert';

const displayAlert = new DisplayAlert();

class SignUpScreen extends Component {
    constructor(props){
        super(props);

        this.state={
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPass: '',
            visible: false,
            confirmVisible: false
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
        const { email, password, confirmPass, firstName, lastName} = this.state;
        if (email === '' || password === '' || confirmPass === '' || firstName === '' || lastName === ''){
            displayAlert.displayAlert('All fields must be entered.');
        }
        else if (!this.emailIsValid(email)){
            displayAlert.displayAlert('Invalid email.');
        }
        else if (password.length <= 5){
            displayAlert.displayAlert('Password must be at least 6 characters');
        }
        else if (password !== confirmPass){
            displayAlert.displayAlert('Passwords do not match.');
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
                    return Promise.reject(new Error(`User already created.`));
                }
                if (response.status === 500){
                    return Promise.reject(new Error(`Server error.`));
                }
                this.setState({firstName: '',lastName: '',email: '',password: '', confirmPass: ''})
                return displayAlert.displayAlert('User created.');
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
    }

    render(){
        const { navigation } = this.props;
        const { firstName, lastName, email, password, confirmPass, visible, confirmVisible } = this.state;
        const bgDark = "darkBlue.700";
        const textColour = "white";
        return (
            <NativeBaseProvider>
                <Center flex={1} bg={bgDark}>
                    <Center>
                        <VStack>
                            <Box>
                                <VStack alignItems="center" space={5} w="100%">
                                    <Input w="100%" placeholder="First Name" placeholderTextColor={textColour} color={textColour}
                                        onChangeText={value => {this.setState({firstName: value})}} value={firstName}/>
                                    <Input w="100%" placeholder="Last Name" placeholderTextColor={textColour} color={textColour}
                                        onChangeText={value => {this.setState({lastName: value})}} value={lastName}/>
                                    <Input w="100%" placeholder="Email" placeholderTextColor={textColour} color={textColour}
                                        onChangeText={value => this.setState({email: value})} value={email}/>
                                    <Input type={visible ? "text" : "password"}
                                        InputRightElement={<Pressable onPress={() => this.setState({visible: !visible})}><Icon as={<MaterialIcons 
                                        name={visible ? "visibility" : "visibility-off"}/>} size={5} mr="2" 
                                        color={textColour}/></Pressable>} placeholder="Password" placeholderTextColor={textColour} color={textColour}
                                        onChangeText={value => this.setState({password: value})} value={password}/>
                                    <Input isRequired type={confirmVisible ? "text" : "password"}
                                        InputRightElement={<Pressable onPress={() => this.setState({confirmVisible: !confirmVisible})}><Icon as={<MaterialIcons 
                                        name={confirmVisible ? "visibility" : "visibility-off"}/>} size={5} mr="2" 
                                        color={textColour}/></Pressable>} placeholder="Confirm Password" placeholderTextColor={textColour} color={textColour}
                                        onChangeText={value => this.setState({confirmPass: value})} value={confirmPass}/>
                                    <HStack w="100%" justifyContent="space-between">
                                        <Button colorScheme='blueGray' w="45%" onPress={() => navigation.navigate('Login')}>Cancel</Button>
                                        <Button colorScheme='blueGray' w="45%" onPress={() => this.signup()}>Sign Up</Button>
                                    </HStack>
                                </VStack>
                            </Box>
                        </VStack>
                    </Center>
                </Center>
            </NativeBaseProvider>
        );
    }
}

SignUpScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default SignUpScreen;