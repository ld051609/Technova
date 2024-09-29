import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';

const EmergencyContacts = () => {
  const [phone, setPhone] = useState('');
  const ngrok_url = process.env.EXPO_PUBLIC_NGROK_URL;
  
  const handleAddContact = async () => {
    if (!phone) {
      Alert.alert('Please enter a phone number');
      return;
    }

    try {
      const response = await fetch(`${ngrok_url}/add_contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        setPhone('');
        Alert.alert('Contact added successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert(errorData.error);
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Emergency Contacts</Text>
        <Text style={styles.explain}>When you share your location, a message with your location will be sent to the people in the emergency contacts</Text>

        <TextInput
          placeholder="Enter phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
          placeholderTextColor="grey" 

        />

        <TouchableOpacity style={styles.button} onPress={handleAddContact}>
          <Text style={styles.buttonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  explain: {
    fontSize: 12,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    width: 150,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'flex-end',
},
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmergencyContacts;
