const showCrimeAlert = (index, crimes) => {
    if (index >= crimes.length) return; // Exit if no more crimes to show

    const crime = crimes[index];
    // Check if this crime has already been alerted
    if (alertedCrimes.has(crime.id)) { // Assuming each crime has a unique 'id' property
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
          }
        },
      ],
    );
  };
export default showCrimeAlert;