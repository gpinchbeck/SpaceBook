import React, { Component } from 'react';
import { Image } from 'react-native';
import { Box, NativeBaseProvider, Text, VStack, Button, Icon, Pressable, HStack, FlatList, Divider, Fab, Modal, FormControl, Input } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import Moment from 'react-moment';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class FeedScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: {},
            posts: [],
            ids: [],
            uploadModalVisible: false,
            viewPostModalVisible: false,
            postText: '',
            currentPost: [],
            editText: '',
            editVisible: false,
        }
    }

    componentDidMount(){
        const { navigation } = this.props;
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getIds();
            navigation.addListener('focus', () => {
                this.getIds();
            });
        });
    }

    getIds(){
        const { data } = this.state;
        const idList = [data.id];
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/friends`, {
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only view the friends of yourself or your friends`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            }
            return response.json()
        })
        .then((responseJson) => {
            for (let i = 0; i < responseJson.length; i+=1){
                idList.push(responseJson[i].user_id);
            }
            this.setState({ids: idList});
            this.getPosts();
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    getPosts(){
        const { data, ids } = this.state;
        const postsList = [];
        const idList = ids;
        for (let i = 0; i < idList.length; i+=1){
            fetch(`http://localhost:3333/api/1.0.0/user/${ idList[i] }/post`, {
                method: 'GET',
                headers: {
                    'X-Authorization': data.token
                }
            })
            .then((response) => {
                if (response.status === 401){
                    return Promise.reject(new Error(`Unauthorised`));
                }
                if (response.status === 403){
                    return Promise.reject(new Error(`Can only view the posts of yourself or your friends.`));
                }
                if (response.status === 404){
                    return Promise.reject(new Error(`Not found.`));
                }
                if (response.status === 500){
                    return Promise.reject(new Error(`Server error.`));
                }
                return response.json()
            })
            .then((responseJson) => {
                if (responseJson.length > 0){
                    for (let j=0;j<responseJson.length;j+=1){
                        this.getProfileImage(idList[i])
                        .then((responseBlob) => {
                            const responseUrl = URL.createObjectURL(responseBlob);
                            postsList.push([responseJson[j], responseUrl])
                            this.setState({
                                posts: postsList
                            });
                        });
                    }
                }
            })
            .catch((error) => {
                displayAlert.displayAlert(error);
            });
        }
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
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            }
            return response.blob();
        })
    }

    uploadPost(){
        const { data, postText } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': data.token
            },
            body: JSON.stringify({
                text: postText
            })
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only view the friends of yourself or your friends.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            }            
            this.getPosts(); 
            return displayAlert.displayAlert('Post uploaded.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    deletePost(postId) {
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/post/ ${ postId }`, {
            method: 'DELETE',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only delete your own posts.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            } 
            this.getPosts();
            this.setState({viewPostModalVisible: false});
            return displayAlert.displayAlert('Post deleted.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    updatePost(postId) {
        const { data, editText } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/post/${ postId }`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': data.token
            },
            body: JSON.stringify({text: editText})
        })
        .then((response) => {
            if (response.status === 400){
                return Promise.reject(new Error(`Bad request.`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only update your own posts.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            } 
            this.getPosts();
            this.setState({viewPostModalVisible: false})
            return displayAlert.displayAlert('Post updated.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        });
    }

    likePost(userPostId, postId){
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ userPostId }/post/${ postId }/like`, {
            method: 'POST',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 400){
                return Promise.reject(new Error(`Post already liked.`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only like your friends posts.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            } 
            this.getPosts();
            this.setState({viewPostModalVisible: false});
            return displayAlert.displayAlert('Post liked');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    deleteLike(userPostId, postId) {
        const { data } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ userPostId }/post/${ postId }/like`, {
            method: 'DELETE',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => {
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised.`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`You have not liked this post.`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found.`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error.`));
            } 
            this.getPosts();
            this.setState({viewPostModalVisible: false});
            return displayAlert.displayAlert(`Post unliked, ${postId}`);
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    viewPost(item){
        return (
        <HStack justifyContent="space-between">
            <Box>
                <HStack space={5}>
                    <Image source={{uri: item[1]}} style={{width: 50, height: 50, borderRadius: 100}} accessible accessibilityLabel={`Profile Picture for ${ item[0].author.first_name } ${ item[0].author.last_name }`}/>
                    <VStack>
                        <Text  bold>{item[0].author.first_name} {item[0].author.last_name}</Text>
                        <Text>{item[0].text}</Text>
                    </VStack>
                </HStack>
            </Box>
            <VStack>
                <Text><Moment date={item[0].timestamp} format="D MMM"/></Text>
                <Box alignSelf="flex-start">
                    <Text>Likes: {item[0].numLikes}</Text>
                </Box>
            </VStack>
        </HStack>
        );
    }

    render(){
        const { navigation } = this.props;
        const { uploadModalVisible, viewPostModalVisible, posts, currentPost, editVisible, data, editText, postText } = this.state;
        return (
            <NativeBaseProvider>
                <Box flex={1} boxSize="100%">
                    <FlatList extraData={this.state} data={posts}
                        renderItem={({item}) => (
                            <Pressable onPress={() => {this.setState({viewPostModalVisible: true, currentPost: item})}} pl="5" pr="5" pb="5" pt="5">
                                {this.viewPost(item)}
                                <Divider mt={10} bg="muted.400"/>
                            </Pressable>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <Fab onPress={() => this.setState({uploadModalVisible: true})} bg="darkBlue.700" icon={<Icon as={<MaterialIcons style={{color: "white", fontSize: 30}} name="post-add"/>}/>} size={50} placement="bottom-right"/>
                    <Fab onPress={() => navigation.navigate('Drafts')} bg="darkBlue.700" label={<Text color="white" fontSize="sm">Drafts</Text>} size={50} placement='bottom-left'/>
                    <Modal isOpen={uploadModalVisible} onClose={() => this.setState({uploadModalVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Add Post</Modal.Header>
                            <Modal.Body>
                                <FormControl>
                                    <Input borderColor="coolGray.800" placeholder="Enter text" onChangeText={value => this.setState({postText: value})} value={postText}/>
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({uploadModalVisible: false, postText: ''})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        asyncStorage.saveDraft(data.id, postText);
                                        this.setState({uploadModalVisible: false, postText: ''})
                                        displayAlert.displayAlert('Post saved as draft.');
                                    }}>Save as draft</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        this.uploadPost();
                                        this.setState({uploadModalVisible: false, postText: ''});
                                        }}>Post</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    {currentPost.length > 0 && <Modal isOpen={viewPostModalVisible} onClose={() => this.setState({viewPostModalVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>
                                <Text>Post</Text>
                            </Modal.Header>
                            <Modal.Body>
                                <FormControl>
                                    {this.viewPost(currentPost)}
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                { Object.keys(currentPost[0]).length > 0 && <HStack space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({viewPostModalVisible: false})}>Cancel</Button>
                                    {!editVisible && (currentPost[0].author.user_id === data.id) && <Button bg="darkBlue.700" onPress={() => this.setState({editVisible: true, viewPostModalVisible: false})}>Edit</Button>}
                                    {!editVisible && (currentPost[0].author.user_id === data.id) && <Button bg="darkBlue.700" onPress={() => this.deletePost(currentPost[0].post_id)}>Delete</Button>}
                                    {!editVisible && (currentPost[0].author.user_id !== data.id) && <Button bg="darkBlue.700" onPress={() => this.likePost(currentPost[0].author.user_id,currentPost[0].post_id)}>Like</Button>}
                                    {!editVisible && (currentPost[0].author.user_id !== data.id) && <Button bg="darkBlue.700" onPress={() => this.deleteLike(currentPost[0].author.user_id,currentPost[0].post_id)}>Unlike</Button>}
                                </HStack>}
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>}
                    {currentPost.length > 0 && <Modal isOpen={editVisible} onClose={() => this.setState({editVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Edit Post</Modal.Header>
                            <Modal.Body>
                                <FormControl>
                                    <Input borderColor="coolGray.800" placeholder={currentPost[0].text} onChangeText={value => this.setState({editText: value})} value={editText}/>
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({editVisible: false})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        this.updatePost(currentPost[0].post_id);
                                        this.setState({editVisible: false, postText: ''});
                                        }}>Update</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>}
                </Box>
            </NativeBaseProvider>
        );
    }
}

FeedScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default FeedScreen;