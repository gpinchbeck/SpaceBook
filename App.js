import React, { Component, Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

const LoginScreen = lazy(() => import('./components/LoginScreen'));
const SignUpScreen = lazy(() => import('./components/SignUpScreen'));
const TabNav = lazy(() => import('./components/TabNav'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const UploadPicture = lazy(() => import('./components/UploadPicture'));
const FindFriendsScreen = lazy(() => import('./components/FindFriendsScreen'));
const FriendRequestScreen = lazy(() => import('./components/FriendRequestScreen'));
const DraftsScreen = lazy(() => import('./components/DraftsScreen'));

const Stack = createNativeStackNavigator();

class App extends Component {
  render(){
    return (
      <NavigationContainer>
        <Suspense fallback={<View style={{justifyContent: 'center', alignItems: 'center', height: '100%'}}><Text>Loading...</Text></View>}>
          <Stack.Navigator initialRouteName='Login'>
              <Stack.Screen options={{headerShown: false}} name='Login' component={LoginScreen}/>
              <Stack.Screen options={{title: 'Create an account', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='Signup' component={SignUpScreen}/>
              <Stack.Screen options={{headerShown: false}} name="TabNav" component={TabNav}/>
              <Stack.Screen options={{title: 'Account Settings', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='Settings' component={SettingsScreen}/>
              <Stack.Screen options={{title: 'Update Picture', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name="Upload" component={UploadPicture}/>
              <Stack.Screen options={{title: 'Find Friends', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='FindFriends' component={FindFriendsScreen}/>
              <Stack.Screen options={{title: 'Friend Requests', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='FriendRequests' component={FriendRequestScreen}/>
              <Stack.Screen options={{title: 'Drafts', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name='Drafts' component={DraftsScreen}/>
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
  )
  }
}

export default App;
