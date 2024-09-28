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

      // Watch location changes
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          sendLocationToBackend(newLocation.coords); // Pass new coordinates
        }
      );

      return () => {
        subscription.remove();
      };
    };

    fetchLocation();
  }, []);

  // Send location to backend to check for nearby crime areas
  const sendLocationToBackend = async () => {
    try {
      if (!location) {
        console.log('No location data');
        return;
      }
      const response = await fetch('https://9de8-129-97-124-137.ngrok-free.app/check_crime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });
  
      const data = await response.json();
      if (data.status === 'danger') {
        const crimeDetails = data.nearby_crimes
          .map(crime => `${crime.NearestIntersectionLocation} (${crime.rating}) - ${crime.distance.toFixed(2)} km away`)
          .join('\n');
  
        Alert.alert('Warning', `You are near crime areas:\n${crimeDetails}`, [
          { text: 'OK', onPress: () => console.log(data.nearby_crimes) },
        ]);
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
