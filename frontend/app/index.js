import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons'; // Import icons
import Form from './tabs/Form';
import Map from './tabs/Maps';
import Contact from './tabs/Contact';
const Tab = createBottomTabNavigator();

export default function App() {
  return(
      <Tab.Navigator>
        <Tab.Screen name="Maps" component={Map} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }} 
        />
        <Tab.Screen name="Form" component={Form} 
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

};
