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
export default decodePolyline;