import { View, Button, TextInput, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../configs/firebaseConfig';
import { ActivityIndicator, KeyboardAvoidingView  } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            console.log(res);
            alert('check email!')
        } catch (error) {
            console.log(error);
            alert('sign in failed: ' + error.message)
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            console.log(res);
            alert('check email!')
        } catch (error) {
            console.log(error);
            alert('sign up failed: ' + error.message)
        } finally {
            setLoading(false);
        }
    }


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='padding'>
                <TextInput 
                    value={email}
                    style={styles.input} 
                    placeholder='Email'
                    placeholderTextColor={'gray'}
                    autoCapitalize='none'
                    onChangeText={(text) => setEmail(text)}
                />
                <TextInput 
                    value={password}
                    style={styles.input} 
                    secureTextEntry={true}
                    placeholder='Password' 
                    placeholderTextColor={'gray'}
                    autoCapitalize='none'
                    onChangeText={(text) => setPassword(text)}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" /> // 색상 코드 수정
                ) : (
                    <>
                        <Button title="Login" onPress={signIn} /> 
                        <Button title="Create account" onPress={signUp} /> 
                    </>
                )}
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center'
    },
    input: {
        marginVertical: 4,
        height: 50,
        borderRadius: 4,
        borderWidth: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
})

export default LoginPage;