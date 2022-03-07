import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import TabNav from './components/TabNav';
import SettingsScreen from './components/SettingsScreen';
import UploadPicture from './components/UploadPicture';
import FindFriendsScreen from './components/FindFriendsScreen';
import FriendRequestScreen from './components/FriendRequestScreen';
import DraftsScreen from './components/DraftsScreen';

const Stack = createNativeStackNavigator();

class App extends Component {
  render(){
    return (
      <NavigationContainer>
          <Stack.Navigator initialRouteName='Login'>
              <Stack.Screen options={{headerShown: false}} name='Login' component={LoginScreen}/>
              <Stack.Screen options={{title: 'Create an account', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='Signup' component={SignUpScreen}/>
              <Stack.Screen options={{headerShown: false}} name="TabNav" component={TabNav}/>
              <Stack.Screen options={{title: 'Account Settings', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='Settings' component={SettingsScreen}/>
              <Stack.Screen options={{title: 'Update Picture', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name="Upload" component={UploadPicture}/>
              <Stack.Screen options={{title: 'Find Friends', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='FindFriends' component={FindFriendsScreen}/>
              <Stack.Screen options={{title: 'Friend Requests', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='FriendRequests' component={FriendRequestScreen}/>
          </Stack.Navigator>
      </NavigationContainer>
  )
  }
}

export default App;
