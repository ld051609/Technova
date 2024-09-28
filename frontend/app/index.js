import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './components/LoginPage/Login';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FIREBASE_AUTH } from '../configs/firebaseConfig';
import TabNavigator from './components/TabNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack.Navigator initialRouteName="Login">
      {user ? (
        <Stack.Screen name="Home" component={TabNavigator} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}