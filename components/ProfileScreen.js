import React, { Component } from 'react';
import { Button, Text, View, Image } from 'react-native';
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
        const { loginInfo, userData, img } = this.state;
        return (
            <View>
                <Text>Profile</Text>
                <Text>Login id: {loginInfo.id}</Text>
                <Text>Login token: {loginInfo.token}</Text>
                <View>
                    <Image source={{uri: img}}
                        style={{width:100, height:100, borderWidth: 1}} />
                    <Text>{userData.first_name}</Text>
                    <Text>{userData.last_name}</Text>
                    <Text>{userData.email}</Text>
                    <Text>{userData.friend_count}</Text>
                </View>
                <View>
                    <Button title="Account Settings" onPress={() => navigation.navigate('Settings')} />
                    <Button title="Logout" onPress={() => this.logout(navigation)} />
                </View>
            </View>
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
