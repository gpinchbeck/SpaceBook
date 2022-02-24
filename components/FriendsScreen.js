import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        getData((data) => {
            this.setState({
                data
            });
            this.getFriends();
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
        const { friends } = this.state;
        return (
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
        );
    }
}

export default FriendsScreen;