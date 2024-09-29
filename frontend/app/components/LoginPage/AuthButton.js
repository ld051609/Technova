import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const AuthButton = ({ signIn, signUp }) => {
    const [buttonActive, setButtonActive] = useState(false);
    return (
        <>
            <TouchableOpacity
                style={[styles.loginBtn, buttonActive && styles.buttonActive]}
                onPressIn={() => setButtonActive(true)}
                onPressOut={() => setButtonActive(false)}
                onPress={signIn}
            >
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={signUp}>
                <Text style={styles.signUpText}>Create account</Text>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    loginBtn:{
        backgroundColor: '#007bff',
        paddingVertical: 10,
        marginVertical:10,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    buttonActive: {
        backgroundColor: '#0056:b3',
    },
    loginText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
    signUpText: {
        color: '#007BFF',
        fontSize: 15,
        textDecorationLine: 'underline',
        textAlign: 'center',
    },
});

export default AuthButton;
