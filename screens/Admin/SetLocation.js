import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import * as Location from 'expo-location';
import { SelectList } from 'react-native-dropdown-select-list';
import client from '../../connection/connectApi';
import { useAuth } from '../../connection/authContext';

const SetLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [gates, setGates] = useState([]);
  const [subKey, setSubKey] = useState([]);
  const { authState } = useAuth();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const onSetSnackBar = () => setVisible(true);
  const onDismissSnackBar = () => setVisible(false);

  const handleSetLocation = async () => {
    try {
      if (subKey.length > 0 && location) {
        await client.post(`/gate/loc/${subKey[0].split(":")[2]}`, {
          LocationLat: location.coords.latitude,
          LocationLon: location.coords.longitude,
        })
        .then((response) => {
          console.log('Response:', response.data.data);
          setMessage(response.data.message);
          onSetSnackBar();
        })
        .catch((error) => {
          console.log('Error:', error.message);
          setMessage(error.message); // Update snackbar message with error message
          onSetSnackBar();
        });
      }
    } catch (error) {
      console.log('Error:', error.message);
      setMessage(error.message); // Update snackbar message with error message
      onSetSnackBar();
    }
  };

  const getGates = async () => {
    try {
      let key = authState.user_id;
      if (key) {
        await client.get(`/gate/${key}`)
          .then((response) => {
            console.log('Response:', response.data.data);
            let newArray = response.data.data.map((item) => {
              return { key: item.id, value: `${item.name}:${item.subscription}:${item.id}` };
            });
            setGates(newArray);
          })
          .catch((error) => {
            console.log('Error:', error.message);
            setMessage(error.message); // Update snackbar message with error message
            onSetSnackBar();
          });
      }
    } catch (error) {
      console.log('Error:', error.message);
      setMessage(error.message); // Update snackbar message with error message
      onSetSnackBar();
    }
  };

  useEffect(() => {
    const getPermissionsAndLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log("Please grant location permissions");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log("Location:", currentLocation);

      let address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setAddress(address[0]); // Set the first address result
    };

    getPermissionsAndLocation();
    getGates();
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <View style={{ flex: 1, width: '100%', padding: 10 }}>
          <Text style={{ fontSize: 17, marginBottom: 20, fontWeight: "400", marginLeft: -10 }}>Select the gate Present at Current location :</Text>
          <SelectList
            setSelected={(val) => setSubKey([val])}
            data={gates}
            save="value"
            placeholder='Select Gate'
          />
          <Button
            mode="contained"
            onPress={handleSetLocation}
            style={styles.button}
            labelStyle={styles.buttonText}
            disabled={!subKey.length}
          >
            Set Location
          </Button>
        </View>
      ) : (
        <Text style={styles.errorText}>
          Error: Location data can't be fetched. Please enable location access for the app in settings or check your Internet connection.
        </Text>
      )}

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: onDismissSnackBar,
        }}
      >
        {message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    height: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  map:{
    height:'100%',
    width:'95%',
    marginBottom:20,
  },
  addressText: {
    fontSize: 17,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 19,
    marginTop: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    width: "100%",
    height: 45,
    borderColor: '#991219',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFD8D6',
  },
  mapContainer:{
    width:'100%',
    height: '40%',
    justifyContent:'center',
    alignItems:'center'
  },
  buttonText: {
    color: '#991219',
    fontSize: 16,
  },
});

export default SetLocation;
