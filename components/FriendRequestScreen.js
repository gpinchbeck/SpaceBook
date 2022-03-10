import React, { Component } from 'react';
import { Box, NativeBaseProvider, HStack, Text, Pressable, Icon, FlatList, Divider } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
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
        const bgDark = "darkBlue.700";
        const textColour = "white";
        return (
            <NativeBaseProvider>
                <Box flex={1} pl="5" pr="5">
                    <FlatList extraData={this.state} data={requestList} 
                        renderItem={({item}) => (
                            <Box flex={1}>
                                <HStack w="100%" justifyContent="space-between" p="5">
                                    <Text>{item.first_name} {item.last_name}</Text>
                                    <HStack space={2}>
                                        <Pressable borderRadius={100} p="2" bg={bgDark} onPress={() => this.acceptRequest(item.user_id)}><Icon as={<MaterialIcons name="add"/>} size={5} color={textColour}/></Pressable>
                                        <Pressable borderRadius={100} p="2" bg={bgDark} onPress={() => this.declineRequest(item.user_id)}><Icon as={<MaterialIcons name="delete"/>} size={5} color={textColour}/></Pressable>
                                    </HStack>
                                </HStack>
                                <Divider bg="muted.400"/>
                            </Box>
                        )}
                        key={Object.keys(requestList).length}
                        keyExtractor={(item) => item.user_id}
                    />
                </Box>
            </NativeBaseProvider>
        );
    }
}

export default FriendRequestScreen;