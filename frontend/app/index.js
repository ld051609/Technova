import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, ActivityIndicator, Keyboard } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import decodePolyline from '../component/decodePolyline';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState([]);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWalking, setIsWalking] = useState(false); // New state to track walking status

  useEffect(() => {
    const fetchLocation = async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Get current location
      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
        console.log('Current location:', currentLocation);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Error fetching location');
      } finally {
        setLoading(false);
      }

      // Watch location changes only if user is walking
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 20,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          if (isWalking) { // Send location only if user is walking
            sendLocationToBackend(newLocation.coords);
          }
        }
      );

      return () => {
        subscription.remove();
      };
    };

    fetchLocation();
  }, [isWalking]); // Depend on isWalking

  // Function to start walking (triggered when user starts navigating)
  const startWalking = () => {
    setIsWalking(true);
  };

  // Function to stop walking (when the route is completed or user stops)
  const stopWalking = () => {
    setIsWalking(false);
  };

  // Send location to backend to check for nearby crime areas
  const sendLocationToBackend = async (coords) => {
    if (!coords) {
      console.log('No location data');
      return;
    }
  
    try {
      const response = await fetch('https://9de8-129-97-124-137.ngrok-free.app/check_crime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      });
  
      const data = await response.json();
  
      // Trigger alert only when walking and there's danger
      if (isWalking && data.status === 'danger' && data.nearby_crimes && data.nearby_crimes.length > 0) {
        const crimeDetails = data.nearby_crimes.map(crime => 
          `Location: ${crime.NearestIntersectionLocation}\n` +
          `Rating: ${crime.rating}\n` +
          `Crime Rate: ${crime.crime_rate}\n` +
          `Distance: ${crime.distance.toFixed(2)} meters`
        ).join('\n\n');
  
        // Show alert with detailed crime information
        Alert.alert('Warning', 'You are near a crime area!\n\n' + crimeDetails, [
          {
            text: 'View Details',
            onPress: () => console.log(crimeDetails),
          },
          { text: 'OK' },
        ]);
      }
      // If the status is safe, log this or handle it in some way
      else if (data.status === 'safe') {
        console.log('You are in a safe area.');
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };
  
  const handleSendDestination = async () => {
    try {
      if (!destination) {
        Alert.alert('Error', 'Please enter a destination.');
        return;
      }

      if (!location) {
        Alert.alert('Error', 'Location data is not available.');
        return;
      }

      const response = await fetch('https://9de8-129-97-124-137.ngrok-free.app/get_directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.log('Response from backend:', data);

      // Clear the input field and dismiss the keyboard
      setDestination('');
      Keyboard.dismiss();

      if (data.routes && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setDirections(points);

        const destinationLatLng = {
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
        };
        setDestinationCoordinates(destinationLatLng);
        startWalking(); // Set walking to true when a route is started
      } else {
        Alert.alert('Error', 'Could not retrieve directions.');
      }
    } catch (error) {
      console.error('Error sending destination:', error);
      Alert.alert('Error', 'Something went wrong!');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your destination"
            onChangeText={destination => setDestination(destination)}
            value={destination}
          />
          <Button title="Send Destination" onPress={handleSendDestination} />
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
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="You are here"
              />
            )}
            {destinationCoordinates && (
              <Marker
                coordinate={destinationCoordinates}
                title="Destination"
                pinColor="blue"
              />
            )}
            {directions.length > 0 && (
              <Polyline
                coordinates={directions}
                strokeColor="#000"
                strokeWidth={6}
              />
            )}
          </MapView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    margin: 10,
    borderRadius: 5,
  },
  map: {
    flex: 1,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
