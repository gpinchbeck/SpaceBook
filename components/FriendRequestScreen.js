import React, { Component } from 'react';
import { Image } from 'react-native';
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
        const userList = [];
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
            if (responseJson.length > 0){
                for (let j=0;j<responseJson.length;j+=1){
                    this.getProfileImage(responseJson[j].user_id)
                    .then((responseBlob) => {
                        const responseUrl = URL.createObjectURL(responseBlob);
                        userList.push([responseJson[j], responseUrl]);
                        this.setState({
                            requestList: userList
                        })
                    });
                }
            }
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    getProfileImage(userId) {
        const { data } = this.state;
        return fetch(`http://localhost:3333/api/1.0.0/user/${  userId  }/photo`, {
            method: 'GET',
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
            return response.blob();
        })
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
                                    <Image source={{uri: item[1]}} style={{width: 50, height: 50, borderRadius: 100 }} accessible accessibilityLabel={`Profile Picture for ${ item[0].user_givenname } ${ item[0].user_familyname }`}/>
                                    <Text>{item[0].first_name} {item[0].last_name}</Text>
                                    <HStack alignItems="center" space={2}>
                                        <Pressable borderRadius={100} p="2" bg={bgDark} onPress={() => this.acceptRequest(item[0].user_id)}><Icon as={<MaterialIcons name="add"/>} size={5} color={textColour}/></Pressable>
                                        <Pressable borderRadius={100} p="2" bg={bgDark} onPress={() => this.declineRequest(item[0].user_id)}><Icon as={<MaterialIcons name="delete"/>} size={5} color={textColour}/></Pressable>
                                    </HStack>
                                </HStack>
                                <Divider bg="muted.400"/>
                            </Box>
                        )}
                        key={Object.keys(requestList).length}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </Box>
            </NativeBaseProvider>
        );
    }
}

export default FriendRequestScreen;