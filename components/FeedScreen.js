import React, { Component } from 'react';
import { Box, NativeBaseProvider, Text, VStack, Button, Stack, Icon, Pressable, Center, useContrastText, HStack, Image, FlatList, Circle, ZStack, Divider, Fab, Modal, FormControl, Input } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
// import { Button, FlatList, Text, View, Modal, TextInput, Pressable, StyleSheet } from 'react-native';
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
            currentPost: {},
            editText: '',
            editVisible: false
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
                    return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
                }
                if (response.status === 403){
                    return Promise.reject(new Error(`Can only view the posts of yourself or your friends. Status: ${  response.status}`));
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
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only delete your own posts. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
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
                return Promise.reject(new Error(`Bad request. Status: ${  response.status}`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only update your own posts. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
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
                return Promise.reject(new Error(`Post already liked. Status: ${  response.status}`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`Can only like your friends posts. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
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
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 403){
                return Promise.reject(new Error(`You have not liked this post. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            } 
            this.getPosts();
            this.setState({viewPostModalVisible: false});
            return displayAlert.displayAlert(`Post unliked, ${postId}`);
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    viewPost(){
        const { posts } = this.state;
        return (
            <FlatList extraData={this.state} data={posts}
                renderItem={({item}) => (
                    <Pressable style={styles.listView} onPress={() => {this.setState({viewPostModalVisible: true, currentPost: item})}}>
                        <Text>{item.author.first_name} {item.author.last_name}</Text>
                        <Text><Moment date={item.timestamp} format="LLLL"/></Text>
                        <Text>{item.text}</Text>
                        <Text style={styles.likeView}>Likes: {item.numLikes}</Text>
                    </Pressable>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }

    post(){
        const { currentPost } = this.state;
        if (Object.keys(currentPost).length > 0){
            return (
                <HStack justifyContent="space-between">
                    <Box>
                        <HStack space={5}>
                            <Image source={{uri: item[1]}} size={50} borderRadius="100" alt="Profile Picture"/>
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
            )
        }
    }

    viewSinglePost(){
        const { data, currentPost, editVisible, editText } = this.state;
        if(Object.keys(currentPost).length > 0){
            return (
                <View style={styles.singlePostView}>
                    <Text>{currentPost.author.first_name} {currentPost.author.last_name}</Text>
                    <Text><Moment data={currentPost.timestamp} format="LLLL"/></Text>
                    <Text>{currentPost.text}</Text>
                    <Text style={styles.likeView}>Likes: {currentPost.numLikes}</Text>
                    {editVisible && 
                        <View>
                            <TextInput placeholder='Enter text' onChangeText={(newEditText) => this.setState({editText: newEditText})} value={editText}/>
                            <Button title='Update' onPress={() => this.updatePost(currentPost.post_id)}/>
                        </View>}
                    {!editVisible && (currentPost.author.user_id === data.id) && <Button title='Edit' onPress={() => this.setState({editVisible: true})}/>}
                    {!editVisible && (currentPost.author.user_id === data.id) && <Button title='Delete' onPress={() => this.deletePost(currentPost.post_id)}/>}
                    {!editVisible && (currentPost.author.user_id !== data.id) && <Button title='Like' onPress={() => this.likePost(currentPost.author.user_id,currentPost.post_id)}/>}
                    {!editVisible && (currentPost.author.user_id !== data.id) && <Button title='Unlike' onPress={() => this.deleteLike(currentPost.author.user_id,currentPost.post_id)}/>}
                    <Button title='Cancel' onPress={() => {this.setState({viewPostModalVisible: false, editVisible: false, editText: ''})}}/>
                </View>
            )
        }
        return null;
    }

    render(){
        const { navigation } = this.props;
        const { uploadModalVisible, viewPostModalVisible, postText, posts } = this.state;
        return (
            <NativeBaseProvider>
                <Box flex={1} boxSize="100%">
                    <FlatList extraData={this.state} data={posts}
                        renderItem={({item}) => (
                            <Pressable onPress={() => {this.setState({viewPostModalVisible: true, currentPost: item})}} pl="5" pr="5" pb="5" pt="5">
                                <HStack justifyContent="space-between">
                                    <Box>
                                        <HStack space={5}>
                                            <Image source={{uri: item[1]}} size={50} borderRadius="100" alt="Profile Picture"/>
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
                                <Divider mt={10} bg="muted.400"/>
                            </Pressable>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <Fab onPress={() => this.setState({uploadModalVisible: true})} bg="darkBlue.700" icon={<Icon as={<MaterialIcons style={{color: "white", fontSize: 30}} name="post-add"/>}/>} size={50} justifySelf="center" alignSelf="center" position="absolute" bottom="25"/>
                    <Modal isOpen={uploadModalVisible} onClose={() => this.setState({uploadModalVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Add Post</Modal.Header>
                            <Modal.Body>
                                <FormControl>
                                    <Input borderColor="coolGray.800" placeholder="Enter text"/>
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({uploadModalVisible: false, postText: ''})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => console.log("Draft")}>Save as draft</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        this.uploadPost();
                                        this.setState({uploadModalVisible: false, postText: ''});
                                        }}>Post</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    {/* <Modal isOpen={viewPostModalVisible} onClose={() => this.setState({viewPostModalVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Body>
                                <Text>Post</Text>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({viewPostModalVisible: false})}>Cancel</Button>
                                    <Button>Edit</Button>
                                    
                                    <Button>Like</Button>
                                    <Button>Dislike</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal> */}
                </Box>
            </NativeBaseProvider>
        );
        // return (
        //     <View style={styles.feedView}>
        //         <Modal animationType='none' 
        //             transparent
        //             visible={uploadModalVisible} 
        //             onRequestClose={() => {
        //                 this.setState({uploadModalVisible: !uploadModalVisible});
        //             }}
        //         >
        //             <View style={styles.centeredViewDark}>
        //                 <View style={styles.modalView}>
        //                     <TextInput placeholder='Enter text...' onChangeText={(newPostText) => this.setState({postText: newPostText})} value={postText}/>
        //                     <Button title='Post' onPress={() => {
        //                         this.uploadPost();
        //                         this.setState({uploadModalVisible: false, postText: ''})
        //                     }}/>
        //                     <Button title='Save as draft' onPress={() => {
        //                         asyncStorage.saveDraft(postText);
        //                         this.setState({uploadModalVisible: false, postText: ''})
        //                         displayAlert.displayAlert('Post saved as draft.');
        //                     }}/>
        //                     <Button title='Cancel' onPress={() => this.setState({uploadModalVisible: false, postText: ''})}/>
        //                 </View>
        //             </View>
        //         </Modal>
        //         <Modal animationType='none'
        //             transparent
        //             visible={viewPostModalVisible}
        //             onRequestClose={() => {
        //                 this.setState({viewPostModalVisible: !viewPostModalVisible});
        //             }}
        //         >
        //             <View style={styles.centeredViewDark}>
        //                 <View style={styles.modalView}>
        //                     {this.viewSinglePost()}
        //                 </View>
        //             </View>
        //         </Modal>
        //         <View style={{flex: 1}}>
        //             <View style={styles.listView}>
        //                 {this.viewPost()}
        //             </View>
        //             <View>
        //                 <Button title='Add post' onPress={() => this.setState({uploadModalVisible: true})}/>
        //                 <Button title='Drafts' onPress={() => navigation.navigate('Drafts')}/>
        //             </View>
        //         </View>
        //     </View>
        // )
    }
}

FeedScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default FeedScreen;