import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import * as Paho from 'paho-mqtt';
import * as Location from 'expo-location';
import client from '../../connection/connectApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isWithinGeofence from '../../connection/geofence';

const mqttClient = new Paho.Client(
  '58.84.63.105',
  9001,
  'clientId-' + Math.random().toString(16)
);

const Gate = ({ route }) => {
  const [isConnect, setIsConnect] = useState(false);
  // Note: we now expect geolocked to contain the permission value.
  const { title, body, gate_id, islocked, status, geolocked, lat, lon } = route.params;
  const [open, setOpen] = useState(status === '1' ? false : true);
  const [Locked, setLocked] = useState(islocked);
  const [geoSwitchOn, setgeoSwitchOn] = useState(true);
  const [gateStatusUpdated, setGateStatusUpdated] = useState(false);
  const [InRange, setInRange] = useState(false);
  const [reach, setReach] = useState(false);
  const [mreach, setMReach] = useState(false);
  const [message, setMessage] = useState('');

  const checkRange = (currentLocation) => {
    const userLat = currentLocation.coords.latitude;
    const userLon = currentLocation.coords.longitude;
    console.log('User:', userLat, userLon);
    if (isWithinGeofence(userLat, userLon, lat, lon)) {
      console.log('User is in Range');
      setInRange(true);
    } else {
      console.log('User is out of Range');
      setInRange(false);
    }
  };

  const connectToMQTT = () => {
    if (!isConnect) {
      try {
        mqttClient.connect({
          userName: 'athena',
          password: 'gate_project@3/5/24',
          onSuccess: () => {
            mqttClient.subscribe(`gate/${body}`);
            console.log('MQTT Connected at', body);
            setIsConnect(true);
          },
          onFailure: (responseObject) => {
            console.log('Failed to connect: ', responseObject.errorMessage);
            setIsConnect(false);
            Alert.alert('Error:', "MQTT is Down");
          }
        });
      } catch (error) {
        console.log(error.message);
        if (error.message === "AMQJS0011E Invalid state already connected.") {
          console.log('Disconnecting');
          try {
            mqttClient.disconnect();
          } catch (error) {
            console.log(error);
          }
          setIsConnect(false);
        }
      }
    }
  };

  const getPermissions = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Please grant location permissions");
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    checkRange(currentLocation);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (geoSwitchOn && isConnect) {
        console.log('Checking Location', lat, lon);
        if (lat === '0' && lon === '0') {
          Alert.alert('Error', 'Location not set, ask Admin to set location');
          // onToggleSwitch(); // Remove if not defined
        } else {
          getPermissions();
        }
      }
      if (!isConnect) {
        console.log('Connecting to MQTT');
        connectToMQTT();
      }
    }, 2000);
    return () => clearInterval(interval);
  });

  useEffect(() => {
    connectToMQTT();

    mqttClient.onMessageArrived = (message) => {
      console.log('Message Arrived: ', message.payloadString);
      const gateStatus = message.payloadString;

      if (gateStatus === 'opened') {
        console.log('Gate is Opened');
        setOpen(true);
        client.post(`/gate/${gate_id}`, { status: '2' });
        setGateStatusUpdated(true);
      }
      if (gateStatus === 'closed') {
        console.log('Gate is Closed');
        setOpen(false);
        client.post(`/gate/${gate_id}`, { status: '1' });
      }
      if (gateStatus === 'locked') {
        console.log('Gate is being Locked');
        client.post(`/gate/lock/${gate_id}`, { locked: true })
          .catch((error) => console.log(error))
          .then(() => {
            setLocked(true);
            Alert.alert('Success', 'Gate Locked');
          });
      }
      if (gateStatus === 'unlocked') {
        console.log('Gate is Unlocked');
        client.post(`/gate/lock/${gate_id}`, { locked: false })
          .catch((error) => console.log(error))
          .then(() => {
            setLocked(false);
            Alert.alert('Success', 'Gate Unlocked');
          });
      }
    };

    if (gateStatusUpdated) {
      Alert.alert('Success', 'Gate Opened');
      setGateStatusUpdated(false);
    }

    mqttClient.onConnectionLost = (responseObject) => {
      console.log('Connection Lost: ', responseObject.errorMessage);
      setIsConnect(false);
    };

    return () => {
      if (isConnect) {
        try {
          console.log('Disconnecting from MQTT');
          mqttClient.disconnect();
          setIsConnect(false);
        } catch (error) {
          console.log('Error:', error.message);
        }
      }
    };
  }, [gateStatusUpdated]);

  const PartialopenGate = () => {
    if (isConnect) {
      const message = new Paho.Message('partial_open');
      message.destinationName = `gate/${body}`;
      mqttClient.send(message);
    } else {
      Alert.alert('Error', 'MQTT Client is not connected');
    }
  };

  const FullopenGate = () => {
    if (isConnect) {
      const message = new Paho.Message('full_open');
      message.destinationName = `gate/${body}`;
      mqttClient.send(message);
    } else {
      Alert.alert('Error', 'MQTT Client is not connected');
    }
  };

  const Lock = () => {
    if (isConnect) {
      if (!Locked) {
        const message = new Paho.Message('lock');
        message.destinationName = `gate/${body}`;
        mqttClient.send(message);
      } else {
        const message = new Paho.Message('unlock');
        message.destinationName = `gate/${body}`;
        mqttClient.send(message);
      }
    } else {
      Alert.alert('Error', 'MQTT Client is not connected');
    }
  };

  const onToggle = async () => {
    if (isConnect) {
      const message = new Paho.Message('keep_open');
      message.destinationName = `gate/${body}`;
      mqttClient.send(message);
    } else {
      Alert.alert('Error', 'MQTT Client is not connected');
    }
  };

  useEffect(() => {
    const isReachable = () => {
      if (isConnect) {
        setMReach(true);
        if (geoSwitchOn && InRange && !Locked) {
          setReach(true);
          setMessage("Connected and You are in Range");
        } else if (Locked) {
          setReach(false);
          setMessage("Connected but DND is on");
        } else if (!geoSwitchOn && !Locked) {
          setReach(true);
          setMessage("Connected and Geofence is off");
        } else {
          setReach(false);
          setMessage("Connected but You are out of Range");
        }
      } else {
        setReach(false);
        setMReach(false);
      }
    };
    isReachable();
  }, [isConnect, geoSwitchOn, InRange, Locked]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Gate: {body}</Text>

      <Button
        mode={status}
        onPress={() => Lock()}
        style={styles.button}
        labelStyle={styles.buttonText}>
        {Locked === true ? 'DND on' : 'DnD off'}
      </Button>

      <Button
        mode="contained"
        onPress={PartialopenGate}
        style={styles.button}
        labelStyle={styles.buttonText}
        disabled={!reach}>
        Partial Open
      </Button>

      {/* Conditionally render the extra two buttons if permission is "Give permission" */}
      {geolocked === "Give permission" && (
        <>
          <Button
            mode="contained"
            onPress={FullopenGate}
            style={styles.button}
            labelStyle={styles.buttonText}
            disabled={!reach}>
            Full Open
          </Button>

          <Button
            mode={status}
            onPress={onToggle}
            style={styles.ToggleButton}
            labelStyle={styles.TbuttonText}
            disabled={!reach}>
            {!open ? 'Keep Open' : 'Close Gate'}
          </Button>
        </>
      )}

      <Snackbar visible={true} onDismiss={() => {}}>
        {mreach ? message : "MQTT Disconnected"}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderColor: '#991219',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "#FFEBEE",
    width: 190,
    height: 60,
    margin: 8,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 27,
  },
  TbuttonText: {
    fontSize: 17,
    fontWeight: '400',
  },
  buttonText: {
    color: '#991219',
    fontSize: 17,
    fontWeight: '400',
  },
  text: {
    marginTop: 20,
    fontSize: 19,
    marginBottom: 10,
    marginLeft: 15,
    fontWeight: "600"
  },
  ToggleButton: {
    borderColor: '#991219',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    width: 190,
    height: 60,
    margin: 8,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 27,
  }
});

export default Gate;
