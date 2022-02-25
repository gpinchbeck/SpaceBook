import React, { Component } from 'react';
import { View, Text, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

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
        getData((data) => {
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
        .then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                friends: responseJson
            });
        })
        .catch((error) => {
            console.log(error);
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