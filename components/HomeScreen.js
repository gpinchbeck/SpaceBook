import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import ProfileScreen from './ProfileScreen';
import FeedScreen from './FeedScreen';
import FriendsScreen from './FriendsScreen';

const Tab = createBottomTabNavigator();

class HomeScreen extends Component {
    render(){
        return (
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({focused, color, size}) => {
                        let iconName;

                        if (route.name === 'ProfileScreen'){
                            iconName = focused ? 'profile' : 'profile-outline';
                        } 
                        else if (route.name === 'FeedScreen'){
                            iconName = focused ? 'feed' : 'feed-outline';
                        }
                        else if (route.name === 'FriendsScreen'){
                            iconName = focused ? 'friends' : 'friends-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: 'tomato',
                    tabBarInactiveTintColor: 'gray',
                })}
            >
                <Tab.Screen name="Feed" component={FeedScreen} />
                <Tab.Screen name="Friends" component={FriendsScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        );
    }
}

export default HomeScreen;