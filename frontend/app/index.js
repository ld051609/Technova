import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './components/Login';
import MainPage from './components/MainPage';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FIREBASE_AUTH } from '../configs/firebaseConfig';

const Stack = createNativeStackNavigator();

const InsideStack = createNativeStackNavigator();

function InsideLayout() {
  return (
    <InsideStack.Navigator>
      <InsideStack.Screen name="MainPage" component={MainPage} />
    </InsideStack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      console.log('user', user);
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack.Navigator initialRouteName="Login">
      {user ? (
        <Stack.Screen name="MainPage" component={MainPage} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
