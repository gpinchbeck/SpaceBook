import React, { Component } from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';



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
        getData((data) => {
            this.setState({
                loginInfo: data,
            });
        });
    }

    sendToServer = async (data) => {
        const { loginInfo } = this.state;

        const response = await fetch(data.base64);
        const blob = await response.blob();

        return fetch(`http://localhost:3333/api/1.0.0/user/${  loginInfo.id  }/photo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/png',
                'X-Authorization': loginInfo.token
            },
            body: blob
        })
        .then((res) => {
            console.log("Picture added", res);
        })
        .catch((error) => {
            console.log(error);
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