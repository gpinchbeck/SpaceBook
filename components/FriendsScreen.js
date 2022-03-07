import React, { Component } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import PropTypes from 'prop-types';

import Storage from './Storage'
import DisplayAlert from './DisplayAlert';

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class FriendsScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: {},
            friends: {}
        }
    }

    componentDidMount(){
        const { navigation } = this.props;
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getFriends();
            navigation.addListener('focus', () => {
                this.getFriends();
            });
        });
    }

    getFriends(){
        const { data } = this.state; 
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/friends`, {
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only view the friends of yourself or your friends. Status: ${  response.status}`));
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
                friends: responseJson
            });
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    render() {
        const { navigation } = this.props;
        const { friends } = this.state;
        return (
            <View>
                <View>
                    <FlatList
                        data={friends}
                        renderItem={({item}) => (
                            <View style={{borderWidth: 1, borderColor: 'gray'}}>
                                <Text>{item.user_id}</Text>
                                <Text>{item.user_givenname}</Text>
                                <Text>{item.user_familyname}</Text>
                            </View>
                        )}
                        keyExtractor={(item) => item.user_id}
                    />
                </View>
                <View>  
                    <Button title='Find friends' onPress={() => navigation.navigate('FindFriends')}/>   
                    <Button title='Friend requests' onPress={() => navigation.navigate('FriendRequests')}/>
                </View>
            </View>
        );
    }
}

FriendsScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default FriendsScreen;