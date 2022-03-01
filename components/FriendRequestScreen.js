import React, { Component } from 'react';
import { Button, FlatList, Text, View } from 'react-native';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class FriendRequestScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {},
            requestList: []
        }
    }

    componentDidMount(){
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getRequests();
        });
    }

    getRequests() {
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/friendrequests`, {
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            } 
            return response.json()
        })
        .then((responseJson) => {
            this.setState({requestList: responseJson})
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    acceptRequest(id){
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/friendrequests/${ id }`, {
            method: 'POST',
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
            this.getRequests();
            return displayAlert.displayAlert('Accepted.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    declineRequest(id){
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/friendrequests/${ id }`, {
            method: 'DELETE',
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
            this.getRequests();
            return displayAlert.displayAlert('Declined.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    render(){
        const { requestList } = this.state;
        return (
            <View>
                <FlatList extraData={this.state} data={requestList} 
                    renderItem={({item}) => (
                        <View>
                            <Text>{item.first_name} {item.last_name}</Text>
                            <Button title='Accept' onPress={() => this.acceptRequest(item.user_id)}/>
                            <Button title='Decline' onPress={() => this.declineRequest(item.user_id)}/>
                        </View>
                    )}
                    key={Object.keys(requestList).length}
                    keyExtractor={(item) => item.user_id}
                />
            </View>
        )
    }
}

export default FriendRequestScreen;