import React, { Component } from 'react';
import { Button, FlatList, Text, View, Modal, TextInput, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import DisplayAlert from './DisplayAlert';

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
            currentPost: {}
        }
    }

    componentDidMount(){
        const { navigation } = this.props;
        getData((data) => {
            this.setState({
                data
            });
            this.getIds();
            navigation.addListener('focus', () => {
                this.getIds();
            });
        });
    }

    // get all ids from friends (for loop stuff)

    getIds(){
        const { data } = this.state;
        const idList = [];
        console.log(data.id);
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/friends`, {
            method: 'GET',
            headers: {
                'X-Authorization': data.token
            }
        })
        .then((response) => response.json())
        .then((responseJson) => {
            for (let i = 0; i < responseJson.length; i+=1){
                idList.push(responseJson[i].user_id);
            }
            console.log(idList.length);
            this.setState({ids: idList});
            this.getPosts();
        })
        .catch((error) => {
            console.log(error);
        });
    }

    getPosts(){
        const { data, ids } = this.state;
        const postsList = [];
        const idList = ids;
        idList.push(data.id);
        for (let i = 0; i < idList.length; i+=1){
            fetch(`http://localhost:3333/api/1.0.0/user/${ idList[i] }/post`, {
                method: 'GET',
                headers: {
                    'X-Authorization': data.token
                }
            })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.length > 0){
                    for (let j=0;j<responseJson.length;j+=1){
                        postsList.push(responseJson[j])
                        this.setState({
                            posts: postsList
                        });
                    }
                }
            })
            .catch((error) => {
                console.log(error);
            });
        }
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
            if (response.status === 201){
                displayAlert.displayAlert('Post uploaded.');
            }
            else {
                displayAlert.displayAlert(`${ response.statusText } ${ response.status }`)
            }
            this.getPosts();
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
            if (response.status === 200){
                displayAlert.displayAlert('Post deleted.');
            }
            else {
                displayAlert.displayAlert('You can only delete your own post.');
            }
            this.getPosts();
            this.setState({viewPostModalVisible: false});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    // updatePost() {}

    // likePost(){}

    // deleteLike() {}

    viewPost(){
        const { posts } = this.state;
        return (
            <FlatList extraData={this.state} data={posts}
                renderItem={({item}) => (
                    <Pressable onPress={() => {this.setState({viewPostModalVisible: true, currentPost: item})}}>
                        <Text>{item.author.first_name} {item.author.last_name}</Text>
                        <Text><Moment date={item.timestamp} format="LLLL"/></Text>
                        <Text>{item.text}</Text>
                    </Pressable>
                )}
            />
        )
    }

    viewSinglePost(){
        const { currentPost } = this.state;
        if(Object.keys(currentPost).length > 0){
            return (
                <View>
                    {/* <Text>{currentPost.post_id}</Text> */}
                    <Text>{currentPost.author.first_name} {currentPost.author.last_name}</Text>
                    <Text><Moment data={currentPost.timestamp} format="LLLL"/></Text>
                    <Text>{currentPost.text}</Text>
                    <Button title='Edit' />
                    <Button title='Delete' onPress={() => this.deletePost(currentPost.post_id)}/>
                    <Button title='Cancel' onPress={() => this.setState({viewPostModalVisible: false})}/>
                    <Button title='Like' />
                    <Button title='Unlike' />
                </View>
            )
        }
        return null;
    }

    render(){
        const { uploadModalVisible, viewPostModalVisible, postText } = this.state;
        return (
            <View>
                <Modal animationType='slide' 
                    transparent
                    visible={uploadModalVisible} 
                    onRequestClose={() => {
                        // displayAlert.displayAlert('')
                        this.setState({uploadModalVisible: !uploadModalVisible});
                    }}
                >
                    <View>
                        <TextInput placeholder='Enter text...' onChangeText={(newPostText) => this.setState({postText: newPostText})} value={postText}/>
                        <Button title='Post' onPress={() => {
                            this.uploadPost();
                            this.setState({uploadModalVisible: false})
                        }}/>
                    </View>
                </Modal>
                <View>
                    {this.viewPost()}
                    <Button title='Add post' onPress={() => this.setState({uploadModalVisible: true})}/>
                </View>
                <Modal animationType='none'
                    transparent
                    visible={viewPostModalVisible}
                    onRequestClose={() => {
                        this.setState({viewPostModalVisible: !viewPostModalVisible});
                    }}
                >
                    <View>
                        {this.viewSinglePost()}
                    </View>
                </Modal>
            </View>
        )
    }
}

FeedScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default FeedScreen;