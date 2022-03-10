import React, { Component } from 'react';
import { Box, NativeBaseProvider, Text, VStack, Button, HStack, Image, Divider } from 'native-base';
import PropTypes from 'prop-types';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class ProfileScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginInfo: {},
            userData: {},
            img: null
        };
    }

    componentDidMount() {
        this.getScreen();
    }

    getScreen(){
        const { navigation } = this.props;
        asyncStorage.getData((data) => {
            this.setState({
                loginInfo: data,
            });
            this.getUserData();
            this.getProfileImage();
            navigation.addListener('focus', () => {
                this.getUserData();
                this.getProfileImage();
            });
        });
    }

    getProfileImage() {
        const { loginInfo } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${  loginInfo.id  }/photo`, {
            method: 'GET',
            headers: {
                'X-Authorization': loginInfo.token
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
            return response.blob()
        })
        .then((responseBlob) => {
            const data = URL.createObjectURL(responseBlob);
            this.setState({
                img: data
            });
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    getUserData() {
        const { loginInfo } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${  loginInfo.id}`,{
            method: 'GET',
            headers: {
                'X-Authorization': loginInfo.token
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

            return response.json()
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

    logout(nav) {
        const { loginInfo } = this.state;
        fetch('http://localhost:3333/api/1.0.0/logout', {
            method: 'POST',
            headers: {
                'X-Authorization': loginInfo.token,
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            }
            nav.navigate('Login');
            return displayAlert.displayAlert('Logged out.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    render() {
        const { navigation } = this.props;
        const { userData, img } = this.state;
        return (
            <NativeBaseProvider>
                <Box flex={1} p="5">
                    <VStack flex={1}>
                        <Box pb="5">
                            <HStack space={5}>
                                {img !== null &&<Image source={{uri: img}} size={100} borderRadius="100" alt="Profile Picture"/>}
                                <VStack justifyContent="center" space={2}>
                                    <Text>{userData.first_name}</Text>
                                    <Text>{userData.last_name}</Text>
                                </VStack>
                            </HStack>
                        </Box>
                        <Divider bg="muted.300"/>
                        <Box justifyContent="center" h="50" alignItems="center">
                            
                            <Text>{userData.friend_count} Friends</Text>
                            
                        </Box>
                        <Divider bg="muted.300"/>
                    </VStack>
                    <Box>
                        <VStack space={5}>
                            <Button h="50" bg="darkBlue.700" onPress={() => navigation.navigate('Settings')}>Account Settings</Button>
                            <Button h="50" bg="darkBlue.700" onPress={() => this.logout(navigation)}>Logout</Button>
                        </VStack>
                    </Box>
                </Box>
            </NativeBaseProvider>
        );
    }
}

ProfileScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default ProfileScreen;
