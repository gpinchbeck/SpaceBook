import React, { Component } from 'react';
import { Image } from 'react-native';
import { Box, NativeBaseProvider, Text, Button, VStack, HStack, FlatList, Divider } from 'native-base';
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
            friends: []
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
        const friendsList = [];
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
            if (responseJson.length > 0){
                for (let j=0;j<responseJson.length;j+=1){
                    this.getProfileImage(responseJson[j].user_id)
                        .then((responseBlob) => {
                            const responseUrl = URL.createObjectURL(responseBlob);
                            friendsList.push([responseJson[j], responseUrl])
                            this.setState({
                                friends: friendsList
                            });
                        });
                }
            }
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
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

    viewPost(item){
        return (
            <HStack p="5">
                <Box>
                    <HStack space={5}>
                        <Image source={{uri: item[1]}} style={{width: 50, height: 50, borderRadius: 100 }} accessible accessibilityLabel={`Profile Picture for ${ item[0].user_givenname } ${ item[0].user_familyname }`}/>
                        <Text bold>{item[0].user_givenname} {item[0].user_familyname}</Text>
                    </HStack>
                </Box>
            </HStack>
        );
    }

    render() {
        const { navigation } = this.props;
        const { friends } = this.state;
        return (
            <NativeBaseProvider>
                <Box flex={1} pl="5" pr="5">
                    <Box flex={1}>
                        <FlatList
                            data={friends}
                            renderItem={({item}) => (
                                <Box>
                                    {this.viewPost(item)}
                                    <Divider bg="muted.400"/>
                                </Box>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    </Box>
                    <Box pb="5">
                        <VStack space={5}>
                            <Button h="50" bg="darkBlue.700" onPress={() => navigation.navigate('FindFriends')}>Find Friends</Button>
                            <Button h="50" bg="darkBlue.700" onPress={() => navigation.navigate('FriendRequests')}>Friend requests</Button>
                        </VStack>
                    </Box>
                </Box>
            </NativeBaseProvider>
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