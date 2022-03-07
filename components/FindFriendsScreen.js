import React, { Component } from 'react';
import { View, Text, FlatList, Button, TextInput } from 'react-native';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class FindFreindsScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            searchText: '',
            data: {},
            users: []
        }
    }

    componentDidMount(){
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getUsers();
        });
    }

    getUsers(){
        const { searchText, data } = this.state;
        let url = `http://localhost:3333/api/1.0.0/search`;
        if (searchText !== ''){
            url = `${ url }?q=${ searchText }`;
        }
        fetch(url,{
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 400){
                return Promise.reject(new Error(`Bad request. Status: ${  response.status}`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            } 
            return response.json()
        })
        .then((responseJson) => {
            this.setState({
                users: responseJson
            })
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    addFriend(friendId){
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ friendId }/friends`, {
            method: 'POST',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`User is already added as a friend. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            } 
            return displayAlert.displayAlert('Request sent.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    render(){
        const { users, searchText, data } = this.state;
        return(
            <View>
                <View>
                    <TextInput placeholder='Search' onChangeText={(newSearch) => this.setState({searchText: newSearch})} value={searchText}/>
                    <Button title='Search' onPress={() => this.getUsers()}/>
                </View>
                <View>
                    <FlatList extraData={users} data={users}
                        renderItem={({item}) => (
                            <View>
                                { item.user_id !== data.id && <View>
                                    <Text>{item.user_givenname} {item.user_familyname}</Text>
                                    <Button title='Add' onPress={() => this.addFriend(item.user_id)}/>
                                </View> }
                            </View>
                        )}
                        keyExtractor={(item) => item.user_id}
                    />
                </View>
            </View>
        )
    }
}

export default FindFreindsScreen;