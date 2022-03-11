import React, { Component } from 'react';
// import Moment from 'react-moment';
import { NativeBaseProvider, Box, Modal, FlatList, Button, Text, Pressable, Divider, FormControl, Input } from 'native-base';
// import BackgroundFetch from 'react-native-background-fetch';
// import BackgroundTimer from 'react-native-background-timer';
import DateTimePicker from 'react-datetime-picker';
import './style.css'
// import DateTimePicker from 'react-datetime-picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { BackgroundFetchOptions, BackgroundFetchResult, BackgroundFetchStatus } from 'react-native-web-background-fetch';
import PropTypes from 'prop-types';
import Storage from './Storage';
import DisplayAlert from './DisplayAlert';

const asyncStorage = new Storage();
const displayAlert = new DisplayAlert();

class DraftsScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            data: {},
            newPostText: '',
            editVisible: false,
            drafts: [],
            currentDraft: '',
            viewDraftModalVisible: false,
            viewDate: false,
            date: new Date()
        }
    }

    componentDidMount(){
        const { navigation } = this.props;
        asyncStorage.getData((data) => {
            this.setState({
                data
            });
            this.getDrafts(data.id);
            navigation.addListener('focus', () => {
                this.getDrafts(data.id);
            });
        });
        // BackgroundFetchOptions
    }

    async getDrafts(){
        const { data } = this.state;
        const res = await asyncStorage.getDrafts(data.id);
        this.setState({drafts: res});
    }

    // componentDidMount(){
    //     this.getDrafts();
    //     const schedDate = Moment.add(0, 'd').set({hour:11,minute:40,second:0,millisecod:0})
    //     const diffTime = schedDate.diff(Moment())
    //     this.timeoutId = BackgroundTimer.setTimeout(() => {
    //         console.log('tac');
    //     }, diffTime);
    // }

    // componentWillUnmount(){
    //     BackgroundTimer.clearTimeout(this.timeoutId);
    // }

    // async getDrafts(){
    //     const res = await asyncStorage.getDrafts();
    //     this.setState({drafts: res});
    // }

    // schedTest(){
    //     this.timeoutId = BackgroundTimer.setTimeout(() => {
    //         console.log('tac');
    //     }, 10000);
    // }

    uploadPost(){
        const { data, currentDraft } = this.state;
        fetch(`http://localhost:3333/api/1.0.0/user/${ data.id }/post`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': data.token
            },
            body: JSON.stringify({
                text: currentDraft
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
            asyncStorage.removeDraft(data.id, currentDraft).then(() => this.getDrafts());
            this.setState({currentDraft: '', viewDraftModalVisible: false})
            return displayAlert.displayAlert('Post uploaded.');
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    updateDraft(){
        const { data, newPostText, currentDraft } = this.state;
        asyncStorage.updateDraft(data.id, newPostText, currentDraft).then(() => this.getDrafts());
        displayAlert.displayAlert('Draft updated.');
    }

    render(){
        const { data, drafts, viewDraftModalVisible, currentDraft, viewDate, date, newPostText, editVisible } = this.state;
        return (
            <NativeBaseProvider>
                <Box flex={1} pl="5" pr="5">
                    <FlatList extraData={this.state} data={drafts}
                        renderItem={({item}) => (
                            <Box>
                                <Box p="5">
                                    <Pressable onPress={() => {
                                        this.setState({viewDraftModalVisible: true, currentDraft: item})
                                    }}>
                                        <Text>{item}</Text>
                                    </Pressable>
                                </Box>
                                <Divider bg="muted.400"/>
                            </Box>
                        )}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    <Modal isOpen={viewDraftModalVisible} onClose={() => this.setState({viewDraftModalVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Draft</Modal.Header>
                            <Modal.Body>
                                <Box>
                                    <Text>{currentDraft}</Text>
                                </Box>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({viewDraftModalVisible: false})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({editVisible: true, viewDraftModalVisible: false})}>Edit</Button>
                                    <Button bg="darkBlue.700" onPress={() => {this.uploadPost()}}>Post</Button>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({viewDate: !viewDate})}>Schedule</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                    {currentDraft.length > 0 && <Modal isOpen={viewDate} onClose={() => this.setState({viewDate: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Edit Post</Modal.Header>
                            <Modal.Body h="350">
                                <Box bg="green.300">
                                    <DateTimePicker value={date}  onChange={(newDate) => this.setState({date: newDate})}/>
                                </Box>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({viewDate: false})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => displayAlert.displayAlert(`Post scheduled for ${ date }`)}>Confirm scheduled post</Button>
                                </Button.Group>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>}
                    {currentDraft.length > 0 && <Modal isOpen={editVisible} onClose={() => this.setState({editVisible: false})}>
                        <Modal.Content maxWidth="400px">
                            <Modal.CloseButton/>
                            <Modal.Header>Edit Post</Modal.Header>
                            <Modal.Body>
                                <FormControl>
                                    <Input borderColor="coolGray.800" placeholder={currentDraft} onChangeText={value => this.setState({newPostText: value})} value={newPostText}/>
                                </FormControl>
                            </Modal.Body>
                            <Modal.Footer justifyContent="space-evenly" >
                                <Button.Group space={2}>
                                    <Button bg="darkBlue.700" onPress={() => this.setState({editVisible: false})}>Cancel</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        asyncStorage.removeDraft(data.id, currentDraft).then(() => this.getDrafts());
                                        this.setState({currentDraft: '', viewDraftModalVisible: false});
                                        displayAlert.displayAlert('Draft deleted.');
                                    }}>Delete</Button>
                                    <Button bg="darkBlue.700" onPress={() => {
                                        this.updateDraft();
                                        this.setState({editVisible: false, newPostText: ''});
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

DraftsScreen.propTypes = {
    navigation: PropTypes.shape({
        navigate: PropTypes.func.isRequired,
        addListener: PropTypes.func.isRequired
    }).isRequired
}

export default DraftsScreen;