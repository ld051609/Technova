import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, View, Keyboard, TouchableWithoutFeedback, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const Form = () => {
    const [description, setDescription] = useState('');
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(false);

    const ngrok_url = process.env.EXPO_PUBLIC_NGROK_URL;
    console.log("!!!",ngrok_url)

    useEffect(() => {
        const getLocation = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setCoords(location.coords);
        };
        getLocation();
    }, []);

    const handleSubmit = async () => {
        if (!coords || !description.trim()) {
            Alert.alert('Please provide a crime description and ensure location is available.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${ngrok_url}/form`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    crime: description
                }),
            });

            if (response.ok) {
                Alert.alert("Form submitted successfully");
                setDescription("");
            } else {
                Alert.alert("Submission failed. Please try again.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("An error occurred during submission.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="default" />
                <Text style={styles.heading}>Report an Incident</Text>

                <View style={styles.formGroup}>
                    <TextInput
                        placeholder='Please describe the incident in detail, including what happened and any relevant information (e.g., time, location, people involved)...'
                        value={description}
                        onChangeText={setDescription}
                        style={styles.input}
                        multiline
                        placeholderTextColor="grey"  // Set placeholder color to black
                    />
                    <Text style={styles.charCount}>{description.length}/500</Text>
                </View>

                <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={[styles.button, loading && styles.disabledButton]} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Submit</Text>
                    )}
                </TouchableOpacity>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        margin: 30
    },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        marginBottom: 30,
    },
    formGroup: {
        marginBottom: 20,
    },
    input: {
        height: 300,
        borderColor: '#adb5bd',
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        fontSize: 16,
        lineHeight: 22,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    charCount: {
        textAlign: 'right', 
        fontSize: 14,
        color: '#6c757d',
        marginTop: 5,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#6c757d',
    },
});

export default Form;
