import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/SettingsScreen';
import UploadPicture from './components/UploadPicture';

const Stack = createNativeStackNavigator();

class App extends Component {
  render(){
    return(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="SignUp" component={SignUpScreen}/>
          <Stack.Screen options={{headerShown: false}} name="Home" component={HomeScreen}/>
          <Stack.Screen name='Settings' component={SettingsScreen}/>
          <Stack.Screen name='Upload' component={UploadPicture}/>
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

export default App;