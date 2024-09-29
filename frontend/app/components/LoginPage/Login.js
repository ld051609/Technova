import { View, StyleSheet, Text, TouchableWithoutFeedback, Keyboard, StatusBar} from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../../configs/firebaseConfig';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import LoginInput from './LoginInput';
import AuthButton from './AuthButton';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert('sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert('sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.outerContainer}>
                <StatusBar barStyle="default" />
                <Text style={styles.programNameText}>SafeTrip</Text>
                <View style={styles.innerContainer}>
                    <KeyboardAvoidingView behavior='padding'>
                        <LoginInput 
                                value={email}
                                placeholder='Email'
                                onChangeText={setEmail}
                        />
                        <LoginInput 
                            value={password}
                            placeholder='Password'
                            secureTextEntry={true}
                            onChangeText={setPassword}
                        />

                        {loading ? (
                            <ActivityIndicator size="medium" color="#0000ff" />
                        ) : (
                            <AuthButton
                                signIn={signIn}
                                signUp={signUp}

                            />
                        )}
                    </KeyboardAvoidingView>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    innerContainer: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    programNameText: {
        fontSize: 60,
        color:'#00008b',
        textAlign: 'center',
        marginBottom: 50,
        fontWeight: 'bold'
    },
});

export default LoginPage;
