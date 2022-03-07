import React, { Component } from 'react';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Icon, NativeBaseProvider } from 'native-base';

import FeedScreen from './FeedScreen';
import FriendsScreen from './FriendsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();

class HomeScreen extends Component {
    render(){
        return (
            <NativeBaseProvider>
                <Tab.Navigator
                    initialRouteName='Feed'
                    screenOptions={({ route }) => ({
                        tabBarIcon: ({focused, color, size}) => {
                            let iconName;
                            if (route.name === 'Profile'){
                                iconName = focused ? 'person' : 'person';
                            } 
                            else if (route.name === 'Feed'){
                                iconName = focused ? 'article' : 'article';
                            }
                            else if (route.name === 'Friends'){
                                iconName = focused ? 'people' : 'people';
                            }
                            return <Icon as={<MaterialIcons name={iconName}/>} size={5} color={color}/>;
                        },
                        tabBarActiveTintColor: '#0369a1',
                        tabBarInactiveTintColor: 'gray'
                    })}
                >
                    <Tab.Screen options={{title: 'Friends', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name="Friends" component={FriendsScreen} />
                    <Tab.Screen options={{title: 'Feed', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name="Feed" component={FeedScreen} />
                    <Tab.Screen options={{title: 'Profile', headerStyle: {backgroundColor: "#002851"}, headerTintColor: '#fff', headerTitleAlign: 'center', headerTitleStyle: {fontWeight: 'bold'}}} name="Profile" component={ProfileScreen} />
                </Tab.Navigator>
            </NativeBaseProvider>
        );
    }
}

export default HomeScreen;