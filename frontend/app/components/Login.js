import { View, TextInput, StyleSheet, TouchableOpacity, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { FIREBASE_AUTH } from '../../configs/firebaseConfig';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonActive, setButtonActive] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const res = await signInWithEmailAndPassword(auth, email, password);
            console.log(res);
            alert('check email!');
        } catch (error) {
            console.log(error);
            alert('sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            console.log(res);
            alert('check email!');
        } catch (error) {
            console.log(error);
            alert('sign up failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.outerContainer}>
                <Text style={styles.programNameText}>Program Name</Text>
                <View style={styles.innerContainer}>
                    <KeyboardAvoidingView behavior='padding'>
                        <TextInput 
                            value={email}
                            style={[styles.input, emailFocused && styles.inputFocused]} 
                            placeholder='Email'
                            placeholderTextColor={'gray'}
                            autoCapitalize='none'
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <TextInput 
                            value={password}
                            style={[styles.input, passwordFocused && styles.inputFocused]} 
                            secureTextEntry={true}
                            placeholder='Password' 
                            placeholderTextColor={'gray'}
                            autoCapitalize='none'
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            onChangeText={(text) => setPassword(text)}
                        />

                        {loading ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[styles.loginBtn, buttonActive && styles.buttonActive]}
                                    onPressIn={() => setButtonActive(true)}
                                    onPressOut={() => setButtonActive(false)}
                                    onPress={signIn}
                                >
                                    <Text style={styles.loginText}>Login</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[buttonActive && styles.buttonActive]}
                                    onPressIn={() => setButtonActive(true)}
                                    onPressOut={() => setButtonActive(false)}
                                    onPress={signUp}
                                >
                                    <Text style={styles.signUpText}>Create account</Text>
                                </TouchableOpacity>
                            </>
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slight opacity for the container
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    input: {
        marginVertical: 8,
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        backgroundColor: '#fff',
    },
    inputFocused: {
        borderColor: '#007BFF', // Change border color when focused
    },
    loginBtn: {
        marginVertical: 10,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#007BFF', // Primary color for button
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    

    },
    buttonActive: {
        backgroundColor: '#0056b3', // Darker shade for active state
    },
    programNameText: {
        fontSize: 40,
        color:'#00008b',
        textAlign: 'center',
        marginBottom: 50,
        fontWeight: 'bold'
    },
    signUpText: {
        color: '#007BFF', 
        fontSize: 15,
        textDecorationLine: 'underline',
        textAlign: 'center', 
    },
    loginText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center'
    },
});

export default LoginPage;
