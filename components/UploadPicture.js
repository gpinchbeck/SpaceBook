import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

import DisplayAlert from './DisplayAlert';
import Storage from './Storage'

const asyncStorage = new Storage();

const displayAlert = new DisplayAlert();

class UploadPicture extends Component {
    constructor(props){
        super(props);

        this.state = {
            hasPermission: null,
            type: Camera.Constants.Type.front,
            loginInfo: {}
        }
    }

    async componentDidMount(){
        const { status } = await Camera.requestCameraPermissionsAsync();
        this.setState({hasPermission: status === 'granted'});
        asyncStorage.getData((data) => {
            this.setState({
                loginInfo: data,
            });
        });
    }

    sendToServer = async (data) => {
        const { loginInfo } = this.state;

        const res = await fetch(data.base64);
        const blob = await res.blob();

        return fetch(`http://localhost:3333/api/1.0.0/user/${  loginInfo.id  }/photo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/png',
                'X-Authorization': loginInfo.token
            },
            body: blob
        })
        .then((response) => {
            if (response.status === 400){
                return Promise.reject(new Error(`Bad request. Status: ${  response.status}`));
            }
            if (response.status === 401){
                return Promise.reject(new Error(`Unauthorised. Status: ${  response.status}`));
            }
            if (response.status === 404){
                return Promise.reject(new Error(`Not found. Status: ${  response.status}`));
            }
            if (response.status === 500){
                return Promise.reject(new Error(`Server error. Status: ${ response.status }`));
            } 
            return displayAlert(`Picture uploaded`);
        })
        .catch((error) => {
            displayAlert.displayAlert(error);
        })
    }

    takePicture = async () => {
        if(this.camera){
            const options = {
                quality: 0.5,
                base64: true,
                onPictureSaved: (data) => this.sendToServer(data)
            };
            await this.camera.takePictureAsync(options);
        }
    }

    render() {
        const { hasPermission, type } = this.state;
        if (hasPermission){
            return (
                <View style={styles.container}>
                    <Camera style={styles.camera} type={type} ref={ref => {
                        this.camera = ref;
                        return this.camera;
                    }}>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => {this.takePicture()}}>
                                <Text style={styles.text}> Take Photo </Text>
                            </TouchableOpacity>
                        </View>
                    </Camera>
                </View>
            );
        }    
        return (
            <Text>No access to camera</Text>
        );      
    }
}

export default UploadPicture;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      flexDirection: 'row',
      margin: 20,
    },
    button: {
      flex: 0.1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: 'white',
    },
  });