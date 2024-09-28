import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

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
        <Stack.Screen name="MainPage" component={MainPage} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}