import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback, StatusBar } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import decodePolyline from '../utils/decodePolyline'

export default function Map() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState([]);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWalking, setIsWalking] = useState(false);
  const [nearbyCrimes, setNearbyCrimes] = useState([]);
  const [loadingDirections, setLoadingDirections] = useState(false);
  const [alertedCrimes, setAlertedCrimes] = useState(new Set()); 

  const ngrok_url = process.env.EXPO_PUBLIC_NGROK_URL;

  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Error fetching location');
      } finally {
        setLoading(false);
      }

      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 20,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          if (isWalking) {
            sendLocationToBackend(newLocation.coords);
          }
        }
      );

      return () => {
        subscription.remove();
      };
    };

    fetchLocation();
  }, [isWalking]);

  const startWalking = () => setIsWalking(true);
  const stopWalking = () => setIsWalking(false);

  const sendLocationToBackend = async (coords) => {
    if (!coords) {
      console.log('No location data');
      return;
    }

    try {
      const response = await fetch(`${ngrok_url}/check_crime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
      });

      const data = await response.json();
      if (isWalking && data.status === 'danger' && data.nearby_crimes && data.nearby_crimes.length > 0) {
        // Start showing crime alerts
        showCrimeAlert(0, data.nearby_crimes); // Start from the first crime
      } else if (data.status === 'safe') {
        console.log('You are in a safe area.');
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  const showCrimeAlert = (index, crimes) => {
    if (index >= crimes.length) return; // Exit if no more crimes to show

    const crime = crimes[index];
    // Check if this crime has already been alerted
    if (alertedCrimes.has(crime.id)) { 
      showCrimeAlert(index + 1, crimes); // Show next crime alert
      return;
    }

    const crimeDetails = 
      `Location: ${crime.NearestIntersectionLocation}\n` +
      `Rating: ${crime.rating}\n` +
      `Crime Rate: ${crime.crime_rate}\n` +
      `Distance: ${crime.distance.toFixed(2)} meters`;

    Alert.alert(
      'Warning',
      `You are near a high crime area!\n\n${crimeDetails}`,
      [
        { 
          text: 'Continue', 
          onPress: () => {
            setAlertedCrimes(prev => new Set(prev).add(crime.id)); // Add this crime to alerted set
            showCrimeAlert(index + 1, crimes); // Show next crime alert
          },
          text: 'Share Location',
          onPress: async() => {
            if (location) {
              try {
                const response = await fetch(`${ngrok_url}/share_location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ latitude: location.latitude, longitude: location.longitude }),
                });
    
                // Check if response is ok (status 200-299)
                if (response.ok) {
                  Alert.alert('Success', 'Location shared successfully!');
                } else {
                  Alert.alert('Error', 'Failed to share location.');
                }
              } catch (error) {
                console.error(error);
                Alert.alert('Error', 'An error occurred while sharing location.');
              }
            }
          },
        },
      ],
    );
  };

  const handleSendDestination = async () => {
    if (!destination) {
      Alert.alert('Error', 'Please enter a destination.');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location data is not available.');
      return;
    }

    setLoadingDirections(true); // Start loading directions

    try {
      const response = await fetch(`${ngrok_url}/get_directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_lat: location.latitude,
          origin_lng: location.longitude,
          destination: destination,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setDestination('');
      Keyboard.dismiss();

      if (data.nearby_crimes) {
        setNearbyCrimes(data.nearby_crimes);
      }

      if (data.overview_polyline) {
        const points = decodePolyline(data.overview_polyline);
        setDirections(points);
        const destinationLatLng = {
          latitude: data.destination_lat,
          longitude: data.destination_lng,
        };
        setDestinationCoordinates(destinationLatLng);
        startWalking();
      } else {
        Alert.alert('Error', 'Could not retrieve directions.');
      }
    } catch (error) {
      console.error('Error sending destination:', error);
      Alert.alert('Error', 'Something went wrong!');
    } finally {
      setLoadingDirections(false); // Stop loading directions
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="default" />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your destination"
                onChangeText={setDestination}
                placeholderTextColor="gray"
                value={destination}
              />
              <Button title="Search" onPress={handleSendDestination} />
            </View>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location?.latitude || 37.78825,
                longitude: location?.longitude || -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              showsUserLocation={true}
              followsUserLocation={true}
            >
              {location && (
                <Marker coordinate={location} title="You are here" />
              )}
              {destinationCoordinates && (
                <Marker coordinate={destinationCoordinates} title="Destination" pinColor="blue" />
              )}
              {directions.length > 0 && (
                <Polyline coordinates={directions} strokeColor="#000" strokeWidth={6} />
              )}
              {nearbyCrimes.length > 0 && nearbyCrimes.map((crime, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: crime['Latitude'],
                    longitude: crime['Longitude'],
                  }}
                  title={`Crime at ${crime['NearestIntersectionLocation']}`}
                  description={`Rating: ${crime.rating}\nCrime Rate: ${crime.crime_rate}\nDistance: ${crime.distance.toFixed(2)} meters`}
                  pinColor="red"
                />
              ))}
            </MapView>
            {loadingDirections && (
              <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
            )}
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 10,
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 10,
    fontSize: 16,
    borderColor: '#ccc',
    marginRight: 5,
  },
  map: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
});
