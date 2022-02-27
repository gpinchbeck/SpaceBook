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
        .then((response) => response.blob())
        .then((responseBlob) => {
            const data = URL.createObjectURL(responseBlob);
            this.setState({
                img: data
            });
        })
        .catch((error) => {
            console.log(error);
        })
    }

    async getUserData() {
        const { loginInfo } = this.state;
        const response = await fetch(
            `http://localhost:3333/api/1.0.0/user/${  loginInfo.id}`,
            {
                method: 'get',
                headers: {
                    'X-Authorization': loginInfo.token,
                },
            }
        );
        const result = await response.json();
        this.setState({
            userData: result,
        });
    }

    logout(nav) {
        const { loginInfo } = this.state;
        fetch('http://localhost:3333/api/1.0.0/logout', {
            method: 'post',
            headers: {
                'X-Authorization': loginInfo.token,
            },
            body: {},
        })
            .then((response) => {
                console.log(response.status);
                if (response.status === 200) {
                    displayAlert.displayAlert('Logged out.');
                    nav.navigate('Login');
                } else if (response.status === 401 || response.status === 500) {
                    displayAlert.displayAlert(response.statusText);
                }
            })
            .catch((error) => {
                console.log(error);
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
