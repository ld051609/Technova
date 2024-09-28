import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import LoginPage from './components/Login';


const Stack = createNativeStackNavigator();

export default function App() {
  return(
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name = "Login" component={LoginPage} options={{ headerShown: false }}/>
      </Stack.Navigator>
  );

};

