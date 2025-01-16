import React, { useEffect,useState } from 'react';
import { Text,View, StyleSheet, Alert } from 'react-native';
import { Button, ToggleButton, Switch, Snackbar } from 'react-native-paper';
import * as Paho from 'paho-mqtt';
import * as Location from 'expo-location';
import client from '../../connection/connectApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import isWithinGeofence from '../../connection/geofence';
const mqttClient = new Paho.Client(
    '58.84.63.105',
    // '192.168.0.100',
    9001,
    'clientId-' + Math.random().toString(16)
);
const Gate = ({ route }) => {
    const [isConnect, setIsConnect] = React.useState(false);
    const { title,body, gate_id, islocked,status,geolocked,lat,lon } = route.params;
    const [open, setOpen] = React.useState(status === '1' ? false : true);
    const [Locked, setLocked] = React.useState(islocked);
    const [geoSwitchOn, setgeoSwitchOn] = React.useState(geolocked);

    const [InRange, setInRange] = React.useState(false);
    
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

    const onToggleSwitch = () => {
        try{
        client.post(`/gate/geo/${gate_id}`, {geolocked:!geoSwitchOn}).catch((error) => {
            Alert.alert('Error:', error.message);
        }).then((response) => {
            console.log(response.data);
            }
        );
        }catch(error){
            Alert.alert('Error:', error.message);
        }
    setgeoSwitchOn(!geoSwitchOn);
    console.log((geoSwitchOn ? InRange: true ), InRange, geoSwitchOn);
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
                if (error.message == "AMQJS0011E Invalid state already connected.") {
                    console.log('Disconnecting');
                    try{
                        mqttClient.disconnect();
                    }catch(error){
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
            if(geoSwitchOn && isConnect){
                console.log('Checking Location',lat,lon);
                if (lat=='0' && lon=='0'){
                    Alert.alert('Error', 'Location not set, ask Admin to set location');
                    onToggleSwitch();
                }
                else{
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
            let gateStatus = message.payloadString;

            if (gateStatus === 'opened') {
                console.log('Gate is Opened');
                setOpen(true);
                client.post(`/gate/${gate_id}`, {status: '2'});
            }
            if (gateStatus === 'closed') {
                console.log('Gate is Closed');
                setOpen(false);
                client.post(`/gate/${gate_id}`, {status: '1'});
            }
            if (gateStatus === 'locked'){
                console.log('Gate is being Locked');
                client.post(`/gate/lock/${gate_id}`, {locked:true}).catch((error) => {
                    console.log(error);
                }).then((response) => {
                    setLocked(true);
                    Alert.alert('Success', 'Gate Locked');
                });
            }
            if (gateStatus === 'unlocked'){
                console.log('Gate is Unlocked');
                client.post(`/gate/lock/${gate_id}`, {locked:false}).catch
                ((error) => {
                    console.log(error);
                }).then((response) => {;
                    setLocked(false);
                    Alert.alert('Success', 'Gate Unlocked');
                });
            }
        };
    
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
                }
                catch (error) {
                    console.log('Error:', error.message);
                }
            }
        };
    
    }, []); // Ensure dependencies are correctly managed

    const PartialopenGate = () => {
        if (isConnect){
            const message = new Paho.Message('partial_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);

            Alert.alert('Success', 'Gate Opened');
        }
        else{
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };

    const FullopenGate = () => {
        if (isConnect){
            const message = new Paho.Message('full_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
            
            Alert.alert('Success', 'Gate Opened');
        }
        else{
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };

    const Lock = () => {
        if (isConnect){
            if (!Locked) {
                    const message = new Paho.Message('lock');
                    message.destinationName = `gate/${body}`;
                    mqttClient.send(message);
                }
            else{
                    const message = new Paho.Message('unlock');
                    message.destinationName = `gate/${body}`;
                    mqttClient.send(message);
                }
            }
        else{
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };
    

    const onToggle = async () => {
        if (isConnect){
            const message = new Paho.Message('keep_open');
            message.destinationName = `gate/${body}`;
            mqttClient.send(message);
        }
        else{
            Alert.alert('Error', 'MQTT Client is not connected');
        }
    };

    const [reach, setReach] = useState(false);
    const [mreach,setMReach]= useState(false);
    const [message, setMessage] = useState('');


useEffect(() => {
    const isReachable =  () => {
        if (isConnect){
            setMReach(true);
            if (geoSwitchOn && InRange && !Locked){
                setReach(true);
                setMessage ("Connected and You are in Range")
            }
            else if (Locked){
                setReach(false);
                setMessage ("Connected but DND is on")
            }
            else if (!geoSwitchOn && !Locked){
                setReach(true);
                setMessage ("Connected and Geofence is off")
            } 

            else{
                setReach(false);
                setMessage ("Connected but You are out of Range")
            }
        }
        else{
            setReach(false);
            setMReach(false);
            return('MQTT Client is not connected');
        }
    }
    isReachable();
}, [isConnect,geoSwitchOn,InRange,Locked]);
    return (   
    <View style={styles.container}>
        <Text  style= {styles.text}>Gate: {body}</Text>
        <Text>GeoLock</Text>
        <Text> <Switch value={geoSwitchOn} onValueChange={onToggleSwitch} disabled={!mreach} /> </Text>
        {/* <Button mode="contained" onPress={getPermissions} style={styles.button} labelStyle={styles.buttonText}>
            Get Location
        </Button> */}
        <Button mode={status} onPress={() => Lock()} style={styles.button} labelStyle={styles.buttonText}>
        {Locked === true ? 'DND on' : 'DnD off'}
        </Button>
      <Button mode="contained" onPress={PartialopenGate} style={styles.button} labelStyle={styles.buttonText} disabled={!reach}>
        Partial Open
      </Button>

      <Button mode="contained" onPress={FullopenGate} style={styles.button} labelStyle={styles.buttonText} disabled={!reach}>
        Full Open
      </Button>

    <Button mode={status} onPress={onToggle} style={styles.ToggleButton} labelStyle={styles.TbuttonText} disabled={!reach}>
        {!open ? 'Keep Open' : 'Close Gate'}
    </Button>
    <Snackbar
        visible={true}
        onDismiss={() => {}}
    >
    {mreach ? message:"MQTT Disconnected" }    
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
        backgroundColor:"#FFEBEE",
        width:190,
        height:60,
        margin:8,
        alignContent:'center',
        justifyContent:'center',
        borderRadius:27,

      },
      TbuttonText:{
        fontSize: 17,
        fontWeight:'400',
      },
      
      buttonText: {
        color: '#991219',
        fontSize: 17,
        fontWeight:'400',
      },  text:{
        marginTop:20,
        fontSize: 19,
        marginBottom:10,
        marginLeft:15,
        fontWeight:"600"
      },
      ToggleButton:{
        borderColor: '#991219',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
        width:190,
        height:60,
        margin:8,
        alignContent:'center',
        justifyContent:'center',
        borderRadius:27,
      }
  });

export default Gate;


// import React, { useEffect } from 'react';
// import { View, StyleSheet, Alert } from 'react-native';
// import { Button, ToggleButton } from 'react-native-paper';
// import init from 'react_native_mqtt';
// import AsyncStorage from '@react-native-async-storage/async-storage';


// const Gate = ({ route }) => {
// init({
//   size: 10000,
//   storageBackend: AsyncStorage,
//   defaultExpires: 1000 * 3600 * 24,
//   enableCache: true,
//   reconnect: true,
//   sync : {
//   }
// });
// const { body, gate_id, islocked,status } = route.params;
// const options = {
//     host: '192.168.0.101',
//     port: 9001,
//     path: `/gate/${body}`,
//     id: 'id_' + parseInt(Math.random()*100000)
//   };

// client = new Paho.MQTT.Client(options.host, options.port, options.path);

// useEffect(() => {
// function onConnect() {
//   console.log("onConnect");
//     client.subscribe(options.path);
// }

// function onConnectionLost(responseObject) {
//   if (responseObject.errorCode !== 0) {
//     console.log("onConnectionLost:"+responseObject.errorMessage);
//   }
// }

// function onMessageArrived(message) {
//   console.log("onMessageArrived:"+message.payloadString);
// }


// client.connect({ onSuccess:onConnect });
// client.onConnectionLost = onConnectionLost;
// client.onMessageArrived = onMessageArrived;


// }, []); // Ensure dependencies are correctly managed

//     // const client = mqtt.connect("ws://192.168.0.101:9001");
//     // if (client.connected){
//     //     console.log('Connected');
//     // }
//     return(
//         <View>
//             <Button onPress={() => client.publish('gate/1', 'open')} >Open</Button>
//             <Button onPress={() => client.publish('gate/1', 'close')} >Close</Button>
//         </View>
//     );
// }
// export default Gate;