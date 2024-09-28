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
    loginBtn: {
        marginVertical: 10,
        height: 50,
        borderRadius: 10,
        backgroundColor: '#007BFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonActive: {
        backgroundColor: '#0056b3',
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
