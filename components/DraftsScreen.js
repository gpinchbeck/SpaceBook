import React, { Component } from 'react';
import { Button, FlatList, Modal, Pressable, Text, View } from 'react-native';
import Storage from './Storage'

const asyncStorage = new Storage();

class DraftsScreen extends Component {
    constructor(props){
        super(props);

        this.state = {
            drafts: [],
            currentDraft: '',
            viewDraftModalVisible: false
        }
    }

    componentDidMount(){
        this.getDrafts();
    }

    async getDrafts(){
        const res = await asyncStorage.getDrafts();
        this.setState({drafts: res});
    }

    render(){
        const { drafts, viewDraftModalVisible, currentDraft } = this.state;
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
                        <Button title='Schedule'/>
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
            </View>
        )
    }
}

export default DraftsScreen;