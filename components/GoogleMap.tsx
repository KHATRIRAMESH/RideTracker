import Geolocation, {
  GeolocationResponse as GeoPosition,
  GeolocationError as GeoError,
} from '@react-native-community/geolocation';
import {useEffect, useState} from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker, Region} from 'react-native-maps';
import {socket} from '../socket.ts';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const GoogleMap = () => {
  const [location, setLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Location Permission Denied');
          return;
        }
      }
      trackLocation();
    };

    const trackLocation = () => {
      const watchId = Geolocation.watchPosition(
        (position: GeoPosition) => {
          const coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          console.log('Current position:', coordinates);
          setLocation(coordinates);
          // sendLocationToServer(coordinates);
          socket.emit('locationUpdate', coordinates);
        },
        (error: GeoError) => console.error(error),
        {enableHighAccuracy: true, distanceFilter: 0.5, interval: 5000},
      );
      return () => {
        Geolocation.clearWatch(watchId);
        socket.disconnect();
      };
    };

    requestLocationPermission();
  }, []);

  // const sendLocationToServer = async (coords: Coordinates) => {
  //   try {
  //     await fetch('http://192.168.18.16:3000/latest-location', {
  //       method: 'POST',
  //       headers: {'Content-Type': 'application/json'},
  //       body: JSON.stringify({
  //         driverId: 'driver_123',
  //         ...coords,
  //       }),
  //     });
  //   } catch (err) {
  //     console.error('Error sending location:', err);
  //   }
  // };

  const region: Region | undefined = location
    ? {
        ...location,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : undefined;

  return (
    <View style={{flex: 1}}>
      {region && (
        <MapView
          style={styles.mapView}
          region={region}
          showsUserLocation={true}
          provider={PROVIDER_GOOGLE}>
          <Marker coordinate={region} title="Driver" />
        </MapView>
      )}
    </View>
  );
};
export default GoogleMap;
const styles = StyleSheet.create({
  mapView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
