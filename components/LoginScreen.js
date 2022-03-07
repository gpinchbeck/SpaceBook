import React, { Component } from 'react';
import { Box, Input, NativeBaseProvider, Text, VStack, Button, Stack, Icon, Pressable, Center, useContrastText, HStack } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
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
            visible: false
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
                nav.navigate('TabNav');
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
    }

    render(){
        const { navigation } = this.props;
        const { email, password, visible } = this.state;
        const bgDark = "darkBlue.700";
        const textColour = "white";
        return (
            <NativeBaseProvider>
                <VStack flex={1} bg={bgDark} w="100%" h="100%">
                    <Box alignItems="center" py="50" mt="100">
                        <Text bold fontSize="3xl" color={textColour}>Spacebook.</Text>
                    </Box>
                    <Center>
                        <Box mt="100">
                            <VStack alignItems="center" space={2} w="100%">
                                <Input InputRightElement={<Icon as={<MaterialIcons name="person"/>} 
                                    size={5} mr="2" color={textColour}/>} placeholder="Email" placeholderTextColor={textColour} color={textColour}
                                    onChangeText={(newEmail) => this.setState({email: newEmail})} value={email}
                                />
                                <Input isRequired type={visible ? "text" : "password"}
                                    InputRightElement={<Pressable onPress={() => this.setState({visible: !visible})}><Icon as={<MaterialIcons 
                                    name={visible ? "visibility" : "visibility-off"}/>} size={5} mr="2" 
                                    color={textColour}/></Pressable>} placeholder="Password" placeholderTextColor={textColour} color={textColour}
                                    onChangeText={(newPass) => this.setState({password: newPass})} value={password}
                                />
                                <HStack w="100%" justifyContent="space-between">
                                    <Button colorScheme='blueGray' w="45%" onPress={() => this.login(navigation)}>Login</Button>
                                    <Button colorScheme='blueGray' w="45%" onPress={() => navigation.navigate('Signup')}>Sign up</Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </Center>
                </VStack>
            </NativeBaseProvider>
        );
    }
}

LoginScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default LoginScreen;