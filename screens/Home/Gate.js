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
    const [lastProcessedMessage, setLastProcessedMessage] = useState('');
    const [connectionTimestamp, setConnectionTimestamp] = useState(null);
    const [waitingForFullOpen, setWaitingForFullOpen] = useState(false);
    const [waitingForPartialOpen, setWaitingForPartialOpen] = useState(false);
    const [lastMessageFromPreviousSession, setLastMessageFromPreviousSession] = useState('');
    const [sensorErrors, setSensorErrors] = useState([]);
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

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
        console.log('Attempting MQTT connection...');
        if (!mqttClient.isConnected()) {
            try {
                mqttClient.connect({
                    userName: 'athena',
                    password: 'gate_project@3/5/24',
                    onSuccess: () => {
                        console.log('MQTT Connected successfully');
                        mqttClient.subscribe(`gate/${body}`);
                        setIsConnect(true);
                        setConnectionTimestamp(Date.now());
                    },
                    onFailure: (responseObject) => {
                        console.log('Failed to connect: ', responseObject.errorMessage);
                        setIsConnect(false);
                    }
                });
            } catch (error) {
                console.error('MQTT Connection error:', error);
                setIsConnect(false);
            }
        } else {
            console.log('MQTT already connected');
            setIsConnect(true);
        }
    };

    const ensureMQTTConnection = async () => {
        return new Promise((resolve, reject) => {
            if (mqttClient.isConnected()) {
                resolve(true);
            } else {
                setIsConnect(false);
                connectToMQTT();
                // Wait for connection
                let attempts = 0;
                const checkConnection = setInterval(() => {
                    attempts++;
                    if (mqttClient.isConnected()) {
                        clearInterval(checkConnection);
                        resolve(true);
                    }
                    if (attempts > 5) { // Give up after 5 attempts
                        clearInterval(checkConnection);
                        reject(new Error('Failed to connect to MQTT'));
                    }
                }, 1000);
            }
        });
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
                    onToggle();
                } else {
                    getPermissions();
                }
            }
            if (!mqttClient.isConnected()) {
                console.log('Connecting to MQTT');
                connectToMQTT();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [permissions.geolocation, isConnect, lat, lon]);

    useEffect(() => {
        const connectionCheck = setInterval(() => {
            if (!mqttClient.isConnected()) {
                console.log('MQTT disconnected, attempting reconnect...');
                setIsConnect(false);
                connectToMQTT();
            }
        }, 5000); // Check connection every 5 seconds

        return () => {
            clearInterval(connectionCheck);
            if (mqttClient.isConnected()) {
                mqttClient.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        connectToMQTT();
    
        mqttClient.onMessageArrived = (message) => {
            console.log('Message Arrived: ', message.payloadString);
            let gateStatus = message.payloadString;
            
            // Debug logs to track states
            console.log('Current states when message arrived:', {
                waitingForPartialOpen,
                waitingForFullOpen,
                partialAlertShown,
                alertShown,
                lastProcessedMessage,
                gateStatus
            });
            
            if (gateStatus === lastMessageFromPreviousSession) {
                console.log('Skipping last message from previous session:', gateStatus);
                return;
            }
            
            if (gateStatus === lastProcessedMessage) {
                console.log('Skipping repeated message');
                return;
            }

            setLastMessageFromPreviousSession(gateStatus);
            
            const sensorErrors = [
                'pr-close1', 'pr-close2', 'pr-open1', 'pr-open2',
                'retro-error', 'Electricity-off', 'overcurrent'
            ];
            
            // Add handling for retro_ok message
            if (gateStatus === 'retro_ok') {
                clearSensorError('retro-error');
                return;
            }
            
            if (sensorErrors.includes(gateStatus)) {
                handleSensorError(gateStatus);
            }

            // Don't process partial_open or full_open commands
            if (gateStatus === 'partial_open' || gateStatus === 'full_open') {
                return;
            }

            // Handle partial open status
            if (gateStatus === 'partial') {
                console.log('Received partial status, waiting state:', waitingForPartialOpen);
                if (waitingForPartialOpen) {
                    console.log('Showing partial open success alert');
                    setOpen(true);
                    client.post(`/gate/${gate_id}`, { status: '2' });
                    Alert.alert('Success', 'Gate Partially Opened');
                }
                setLastProcessedMessage(gateStatus);
            }
            // Handle full open status
            else if (gateStatus === 'full') {
                console.log('Received full status, waiting state:', waitingForFullOpen);
                if (waitingForFullOpen) {
                    console.log('Showing full open success alert');
                    setOpen(true);
                    client.post(`/gate/${gate_id}`, { status: '2' });
                    Alert.alert('Success', 'Gate Fully Opened');
                }
                setLastProcessedMessage(gateStatus);
            }
            else if (gateStatus === 'closed') {
                console.log('Gate is Closed');
                setOpen(false);
                client.post(`/gate/${gate_id}`, { status: '1' });
                // Reset all states when gate is closed
                setAlertShown(false);
                setPartialAlertShown(false);
                setWaitingForPartialOpen(false);
                setWaitingForFullOpen(false);
                setLastProcessedMessage('');
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
    }, [gateStatusUpdated, waitingForPartialOpen, waitingForFullOpen]);

    const PartialopenGate = async () => {
        console.log('Partial Open Button Pressed');
        try {
            await ensureMQTTConnection();
            // Reset all states when sending new command
            setWaitingForPartialOpen(true);
            setWaitingForFullOpen(false);
            setPartialAlertShown(false);
            setAlertShown(false);
            setLastProcessedMessage(''); // Reset last processed message
            const message = new Paho.Message('partial_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
            console.log('Partial open message sent to MQTT');
        } catch (error) {
            console.error('Error in partial open:', error);
            Alert.alert('Connection Error', 'Failed to connect to gate. Please try again.');
            setIsConnect(false);
        }
    };
    
    const FullopenGate = async () => {
        console.log('Full Open Button Pressed');
        try {
            await ensureMQTTConnection();
            // Reset all states when sending new command
            setWaitingForFullOpen(true);
            setWaitingForPartialOpen(false);
            setAlertShown(false);
            setPartialAlertShown(false);
            setLastProcessedMessage(''); // Reset last processed message
            const message = new Paho.Message('full_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
            console.log('Full open message sent to MQTT');
        } catch (error) {
            console.error('Error in full open:', error);
            Alert.alert('Connection Error', 'Failed to connect to gate. Please try again.');
            setIsConnect(false);
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
            const command = open ? 'close' : 'keep_open';
            console.log('Sending command:', command);
            if (command === 'close') {
                setAlertShown(false);
                setPartialAlertShown(false);
                setWaitingForPartialOpen(false);
                setWaitingForFullOpen(false);
            }
            const message = new Paho.Message(command);
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

    useEffect(() => {
        if (sensorErrors.length > 0) {
            const rotationInterval = setInterval(() => {
                setCurrentErrorIndex(prevIndex => 
                    prevIndex === sensorErrors.length - 1 ? 0 : prevIndex + 1
                );
            }, 3000);

            return () => clearInterval(rotationInterval);
        }
    }, [sensorErrors]);

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
            setSensorErrors(prevErrors => {
                if (!prevErrors.includes(errorMessages[errorType])) {
                    return [...prevErrors, errorMessages[errorType]];
                }
                return prevErrors;
            });
        }
    };

    const clearSensorError = (errorType) => {
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
            setSensorErrors(prevErrors => 
                prevErrors.filter(error => error !== errorMessages[errorType])
            );
        }
    };

    useEffect(() => {
        console.log('State Debug:');
        console.log('reach:', reach);
        console.log('Locked:', Locked);
        console.log('open:', open);
        console.log('isConnect:', isConnect);
        console.log('permissions:', permissions);
    }, [reach, Locked, open, isConnect, permissions]);

    return (   
        <View style={styles.container}>
            <View style={styles.mainContent}>
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
            </View>

            <Snackbar visible={true} onDismiss={() => {}}>
                {mreach ? message : "MQTT Disconnected"}
            </Snackbar>

            {/* Error Banner - Now positioned at the bottom */}
            {sensorErrors.length > 0 && (
                <View style={styles.errorBanner}>
                    <Text style={styles.errorText} numberOfLines={1} ellipsizeMode="tail">
                        {sensorErrors[currentErrorIndex]}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorBanner: {
        backgroundColor: '#ffebee',
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: '#ff8a80',
        width: '100%',
        position: 'absolute',
        bottom: 0, // This ensures it stays at the bottom
        alignItems: 'center',
        justifyContent: 'center',
        height: 40, // Fixed height for the banner
    },
    errorText: {
        color: '#c62828',
        fontSize: 14,
        fontWeight: '500',
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