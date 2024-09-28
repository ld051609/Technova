import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Form from '../tabs/Form';
import Map from '../tabs/Maps';
import Contact from './tabs/Contact';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Maps" 
        component={Map} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Form" 
        component={Form} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="description" size={size} color={color} />
          ),
        }} 
      />
       <Tab.Screen name="Contact" component={Contact} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="contact-mail" size={size} color={color} />
          ),
        }} 
        />
    </Tab.Navigator>
  );
}
