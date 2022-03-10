import React, { Component } from 'react';
import { NativeBaseProvider, Box, Input, FlatList, Text, Icon, HStack, Pressable, Divider } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
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
        const bgDark = "darkBlue.700";
        const inputBg = "blueGray.500";
        const textColour = "white";
        return (
            <NativeBaseProvider>
                <Box bg='#f2f2f2' pl="5" pr="5">
                    <Box pt="5">
                        <Input bg={inputBg} color={textColour} placeholderTextColor={textColour} placeholder="Search" 
                            InputRightElement={<Pressable onPress={() => this.getUsers()}><Icon as={<MaterialIcons name="search"/>} size={5} mr="2" color={textColour}/></Pressable>}
                            onChangeText={value => this.setState({searchText: value})} value={searchText}/>
                    </Box>
                    <Box>
                        <FlatList extraData={users} data={users}
                        renderItem={({item}) => (
                            <Box flex={1}>
                                { item.user_id !== data.id && <Box>
                                    <HStack w="100%" justifyContent="space-between" p="5">
                                        <Text>{item.user_givenname} {item.user_familyname}</Text>
                                        <Pressable borderRadius={100} p="2" bg={bgDark} onPress={() => this.addFriend(item.user_id)}><Icon as={<MaterialIcons name="add"/>} size={5} color={textColour}/></Pressable>
                                    </HStack>
                                    <Divider bg="muted.400"/>
                                </Box> }
                            </Box>
                        )}
                        keyExtractor={(item) => item.user_id}
                    />
                    </Box>
                </Box>
            </NativeBaseProvider>
        );
    }
}

export default FindFreindsScreen;