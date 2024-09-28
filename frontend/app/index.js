import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState('');
  const [directions, setDirections] = useState([]);
  const [destinationCoordinates, setDestinationCoordinates] = useState(null);
  const [loading, setLoading] = useState(true); // New state for loading
  const [isTracking, setIsTracking] = useState(true); // To control location tracking

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false); // Set loading to false if permission is denied
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
        setLoading(false); // Ensure loading is set to false when done
      }

      // Watch location changes
      const subscription = Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );

      // Clean up the subscription on unmount
      return () => {
        subscription.remove();
      };
    })();
  }, []);

  const handleDestinationInput = (text) => {
    setDestination(text);
  };

  const handleSendDestination = async () => {
    try {
      if (!destination) {
        Alert.alert('Error', 'Please enter a destination.');
        return;
      }

      // Send current location and destination to your backend
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

      // Extract polyline points from directions and decode them
      if (data.routes && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setDirections(points);
        
        // Set the destination coordinates (using the last point of the polyline for simplicity)
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

  // Decode polyline from Google Maps
  const decodePolyline = (t) => {
    const len = t.length;
    const coords = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b = 0;
      let shift = 0;
      let result = 0;

      let byte;
      do {
        byte = t.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlat = ((result >> 1) ^ (-(result & 1)));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        byte = t.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dlng = ((result >> 1) ^ (-(result & 1)));
      lng += dlng;

      coords.push({
        latitude: (lat / 1E5),
        longitude: (lng / 1E5),
      });
    }

    return coords;
  };

  return (
    <View style={styles.container}>
      {loading ? ( // Conditional rendering for loading
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your destination"
            onChangeText={handleDestinationInput}
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
                pinColor="blue" // Customize the destination marker color
              />
            )}
            {directions.length > 0 && (
              <Polyline
                coordinates={directions}
                strokeColor="#000" // Customize the route color
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
