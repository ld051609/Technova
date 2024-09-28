import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [destination, setDestination] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  useEffect(() => {
    (async () => {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      // Watch location changes
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 0.1, // meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
        }
      );
    })();
  }, []);

  // Handle destination input
  const handleDestinationInput = async (text) => {
    setDestination(text);

    // Here, you can implement logic to convert the destination name to coordinates
    // You might use a geocoding service like Google Maps Geocoding API to convert
    // destination name to latitude and longitude.

    // Example:
    // const coords = await getCoordinatesFromDestination(text);
    // setDestinationCoords(coords);
  };

  let displayText = 'Waiting..';
  if (errorMsg) {
    displayText = errorMsg;
  } else if (location) {
    displayText = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your destination"
        onChangeText={handleDestinationInput}
        value={destination}
      />
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
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title={destination}
            pinColor="blue" // Change color for destination marker
          />
        )}
      </MapView>
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
});
