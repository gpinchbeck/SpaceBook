import React, { Component } from 'react';
// import Moment from 'react-moment';
import { Button, FlatList, Modal, Pressable, Text, View } from 'react-native';
// import BackgroundFetch from 'react-native-background-fetch';
// import BackgroundTimer from 'react-native-background-timer';
import DateTimePicker from 'react-datetime-picker';
// import { BackgroundFetchOptions, BackgroundFetchResult, BackgroundFetchStatus } from 'react-native-web-background-fetch';

import Storage from './Storage'

const asyncStorage = new Storage();

class DraftsScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            drafts: [],
            currentDraft: '',
            viewDraftModalVisible: false,
            viewDate: false,
            date: new Date()
        }
    }

    componentDidMount(){
        this.getDrafts();
        // BackgroundFetchOptions
    }

    async getDrafts(){
        const res = await asyncStorage.getDrafts();
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

    render(){
        const { drafts, viewDraftModalVisible, currentDraft, viewDate, date } = this.state;
        return (
            <View>
                <Modal animationType='none'
                    transparent
                    visible={viewDraftModalVisible}
                    onRequestClose={() => {
                        this.setState({viewDraftModalVisible: !viewDraftModalVisible});
                    }}
                >
                    <View>
                        <Text>{currentDraft}</Text>
                        <Button title='Cancel' onPress={() => this.setState({viewDraftModalVisible: false})}/>
                        <Button title='Post'/>
                        <Button title='Schedule' onPress={() => this.setState({viewDate: !viewDate})}/>
                        {viewDate && 
                            <View>
                                <DateTimePicker onChange={(newDate) => this.setState({date: newDate})} value={date}/>
                                <Button title='Confirm scheduled post' onPress={() => console.log(date)}/>
                            </View>}
                    </View>
                </Modal>
                <FlatList data={drafts}
                    renderItem={({item}) => (
                        <View>
                            <Pressable onPress={() => {
                                this.setState({viewDraftModalVisible: true, currentDraft: item})
                            }}>
                                <Text>{item}</Text>
                            </Pressable>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                {/* <Button title='test' onPress={() => this.schedTest()}/> */}
            </View>
        )
    }
}

export default DraftsScreen;