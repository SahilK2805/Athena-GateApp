import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Button, ToggleButton, Switch, Snackbar } from 'react-native-paper';
import * as Paho from 'paho-mqtt';
import * as Location from 'expo-location';
import client from '../../connection/connectApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isWithinGeofence from '../../connection/geofence';
import { useAuth } from '../../connection/authContext.js';

const mqttClient = new Paho.Client(
    '58.84.63.105',
    9001,
    'clientId-' + Math.random().toString(16)
);

const Gate = ({ route }) => {
    const [isConnect, setIsConnect] = useState(false);
    const { title, body, gate_id, islocked, status, geolocked, lat, lon } = route.params;
    const [permission, setPermission] = useState("Give Permission");
    const { authState } = useAuth();
    const [open, setOpen] = useState(status === '1' ? false : true);
    const [Locked, setLocked] = useState(islocked);
    const [geoSwitchOn, setgeoSwitchOn] = useState(true);
    const [gateStatusUpdated, setGateStatusUpdated] = useState(false);
    const [InRange, setInRange] = useState(false);
    const [reach, setReach] = useState(false);
    const [mreach, setMReach] = useState(false);
    const [message, setMessage] = useState('');
    const [alertShown, setAlertShown] = useState(false);
    const [partialAlertShown, setPartialAlertShown] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [permissions, setPermissions] = useState({
        geolocation: true,
        fullOpen: true,
        keepOpen: true,
        dnd: true
    });

    useEffect(() => {
        console.log("Permissions updated:", permissions);
        console.log("Open state:", open);
        console.log("Reach state:", reach);
        console.log("Locked state:", Locked);
    }, [permissions, open, reach, Locked]);

    useEffect(() => {
        const getPermissions = async () => {
            try {
                if (authState && authState.user_id) {
                    const permissionKey = `permission_${authState.user_id}_${gate_id}`;
                    console.log("Checking permissions with key:", permissionKey);
                    
                    const storedPermissions = await AsyncStorage.getItem(permissionKey);
                    console.log("Raw stored permissions:", storedPermissions);
                    
                    if (storedPermissions) {
                        const parsedPermissions = JSON.parse(storedPermissions);
                        console.log("Setting permissions for gate", gate_id, ":", parsedPermissions);
                        setPermissions(parsedPermissions);
                    }
                }
            } catch (error) {
                console.error("Error getting permissions:", error);
            }
        };

        getPermissions();
    }, [authState, gate_id]);

    const handleSensorError = (errorType) => {
        const errorMessages = {
            'pr-close1': 'Proximity Sensor 1 (Close Position) Failure',
            'pr-close2': 'Proximity Sensor 2 (Close Position) Failure',
            'pr-open1': 'Proximity Sensor 1 (Open Position) Failure',
            'pr-open2': 'Proximity Sensor 2 (Open Position) Failure',
            'retro-error': 'Retroreflective Sensor Failure',
            'Electricity-off': 'Power Supply Failure',
            'overcurrent': 'Motor Overcurrent Detected'
        };

        if (errorMessages[errorType]) {
            setHasError(true);
            Alert.alert('Sensor Error', errorMessages[errorType], [
                {
                    text: 'OK',
                    onPress: () => {
                        console.log('Error acknowledged');
                        setHasError(false);
                    }
                }
            ]);
        }
    };
    
    const checkRange = (currentLocation) => {
        let userLat = currentLocation.coords.latitude;
        let userLon = currentLocation.coords.longitude;
        let deviceLat = lat;
        let deviceLon = lon;
        console.log('User:', userLat, userLon);
        if (isWithinGeofence(userLat, userLon, deviceLat, deviceLon)) {
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
            if (!permissions.geolocation || (isConnect && geoSwitchOn)) {
                console.log('Checking Location', lat, lon);
                if (lat === '0' && lon === '0') {
                    Alert.alert('Error', 'Location not set, ask Admin to set location');
                    onToggleSwitch();
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
    }, [permissions.geolocation, isConnect, lat, lon]);

    useEffect(() => {
        connectToMQTT();
    
        mqttClient.onMessageArrived = (message) => {
            console.log('Message Arrived: ', message.payloadString);
            let gateStatus = message.payloadString;
    
            const sensorErrors = [
                'pr-close1', 'pr-close2', 'pr-open1', 'pr-open2',
                'retro-error', 'Electricity-off', 'overcurrent'
            ];
            
            if (sensorErrors.includes(gateStatus)) {
                handleSensorError(gateStatus);
            }
    
            if (gateStatus === 'feedback-open' && !alertShown) {
                console.log('Gate is Opened');
                setOpen(true);
                client.post(`/gate/${gate_id}`, { status: '2' });
                setGateStatusUpdated(true);
                setAlertShown(true);
            }
            else if (gateStatus === 'feedback-partial' && !partialAlertShown) {
                console.log('Gate is Partially Opened');
                setOpen(true);
                client.post(`/gate/${gate_id}`, { status: '2' });
                Alert.alert('Success', 'Gate Partially Opened');
                setPartialAlertShown(true);
            }
            else if (gateStatus === 'closed') {
                console.log('Gate is Closed');
                setOpen(false);
                client.post(`/gate/${gate_id}`, { status: '1' });
                setAlertShown(false);
                setPartialAlertShown(false);
            }
            if (gateStatus === 'locked') {
                console.log('Gate is being Locked');
                client.post(`/gate/lock/${gate_id}`, { locked: true }).catch((error) => {
                    console.log(error);
                }).then((response) => {
                    setLocked(true);
                    Alert.alert('Success', 'Gate Locked');
                });
            }
            if (gateStatus === 'unlocked') {
                console.log('Gate is Unlocked');
                client.post(`/gate/lock/${gate_id}`, { locked: false }).catch((error) => {
                    console.log(error);
                }).then((response) => {
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
        console.log('Partial Open Triggered');
        console.log('Gate State:', open);
        console.log('DND State:', Locked);
        console.log('Reach State:', reach);
        if (isConnect) {
            const message = new Paho.Message('partial_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
        } else {
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };
    
    const FullopenGate = () => {
        console.log('Full Open Triggered');
        console.log('Gate State:', open);
        console.log('DND State:', Locked);
        console.log('Reach State:', reach);
        if (isConnect) {
            const message = new Paho.Message('full_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
        } else {
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };

    const Lock = () => {
        console.log('DND Toggle:', !Locked);
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

    const onToggle = () => {
        console.log('Toggle Triggered');
        console.log('Current Gate State:', open);
        console.log('DND State:', Locked);
        console.log('Reach State:', reach);
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
                return ('MQTT Client is not connected');
            }
        };
        isReachable();
    }, [isConnect, geoSwitchOn, InRange, Locked]);

    useEffect(() => {
        console.log('Permission State:', permissions);
        console.log('Gate Open State:', open);
        console.log('DND State:', Locked);
        console.log('Reach State:', reach);
    }, [permissions, open, Locked, reach]);

    return (   
        <View style={styles.container}>
            <Text style={styles.text}>Gate: {body}</Text>
            
            {/* 1. DND button if permitted */}
            {permissions?.dnd && (
                <Button mode={status} onPress={() => Lock()} style={styles.button} labelStyle={styles.buttonText}>
                    {Locked === true ? 'DND on' : 'DnD off'}
                </Button>
            )}

            {/* 2. Partial Open - Always show */}
            <Button 
                mode="contained" 
                onPress={PartialopenGate} 
                style={styles.button} 
                labelStyle={styles.buttonText} 
                disabled={!reach || Locked || open}
            >
                Partial Open
            </Button>

            {/* 3. Full Open button if permitted */}
            {permissions?.fullOpen && (
                <Button 
                    mode="contained" 
                    onPress={FullopenGate} 
                    style={styles.button} 
                    labelStyle={styles.buttonText} 
                    disabled={!reach || Locked || open}
                >
                    Full Open
                </Button>
            )}

            {/* 4. Keep Open if permitted, Close Gate always shows */}
            {!open && permissions?.keepOpen ? (
                <Button 
                    mode={status} 
                    onPress={onToggle} 
                    style={styles.ToggleButton} 
                    labelStyle={styles.TbuttonText} 
                    disabled={!reach || Locked}
                >
                    Keep Open
                </Button>
            ) : (
                // Always show Close Gate button
                <Button 
                    mode={status} 
                    onPress={onToggle} 
                    style={[
                        styles.ToggleButton,
                        !open && styles.disabledButton
                    ]} 
                    labelStyle={[
                        styles.TbuttonText,
                        !open && styles.disabledButtonText
                    ]}
                    disabled={!open || !reach || Locked}
                >
                    Close Gate
                </Button>
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
    },
    disabledButton: {
        opacity: 0.6,
        backgroundColor: '#f5f5f5',
    },
    disabledButtonText: {
        color: '#666666',
    },
});

export default Gate;
