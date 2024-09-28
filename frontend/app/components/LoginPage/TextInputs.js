import React, { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';

const TextInputs = ({ value, onChangeText, placeholder, secureTextEntry = false }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <TextInput
            value={value}
            style={[styles.input, isFocused && styles.inputFocused]}
            placeholder={placeholder}
            placeholderTextColor={'gray'}
            autoCapitalize='none'
            secureTextEntry={secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={onChangeText}
        />
    );
};

const styles = StyleSheet.create({
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
        borderColor: '#007BFF',
    },
});

export default TextInputs;
