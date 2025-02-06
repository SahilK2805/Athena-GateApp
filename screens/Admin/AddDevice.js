import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import client from '../../connection/connectApi.js';
import { useAuth } from '../../connection/authContext.js';
import { SelectList } from 'react-native-dropdown-select-list';

const AddDevice = () => {
  let date = new Date().toJSON();
  const [emailid, setemailId] = useState('');
  const [userid, setId] = useState('');
  const [subKey, setSubKey] = useState('');
  const [visible, setVisible] = useState(false);
  const [visibleForm, setvisibleForm] = useState(false);
  const [errorMsg, seterrorMsg] = useState("");
  const [gates, setGates] = useState([]);
  const { authState } = useAuth();
  const navigation = useNavigation();

  // New state for geolocation permission
  const [geoPermission, setGeoPermission] = useState('');

  const geoOptions = [
    { key: '1', value: 'Give permission' },
    { key: '2', value: "Don't give permission" }
  ];

  const getGates = async () => {
    let key = authState.user_id;
    try {
      if (key !== null) {
        await client.get(`/gate/${key}`)
          .then((response) => {
            console.log('Response:', response.data.data, 'key:', key);
            // Map the response to the format expected by SelectList.
            let newArray = response.data.data.map((item) => {
              return { key: item.id, value: item.name + ":" + item.subscription + ":" + item.id };
            });
            setGates(newArray);
          })
          .catch((error) => {
            Alert.alert('Error:', error.message);
            console.log('Error:', error);
          });
      }
    } catch (error) {
      seterrorMsg(error.message);
      setVisible(true);
    }
  };

  useEffect(() => {
    getGates();
  }, []);

  const handleAddDevice = async () => {
    console.log('Selected Gate:', subKey);
    console.log('Geolocation Permission:', geoPermission);
    try {
      let response = await client.post(`/gate/share/${subKey[0][2]}`, {
        id: userid,
        geolocation: geoPermission, // Send the selected geolocation option to backend
      }).catch((error) => {
        console.log('Error:', error.response.data.message);
        seterrorMsg(error.response.data.message);
        setVisible(true);
      });

      if (response) {
        seterrorMsg('Device added successfully');
        setVisible(true);
        // After successfully allocating the gate, navigate to the Gate screen.
        // Pass along the geolocation permission as "geolocked" along with other necessary parameters.
        navigation.navigate('Gate', {
          title: 'Your Gate Title',       // Adjust as needed
          body: subKey[0][0],              // Example: you may extract the gate name or identifier
          gate_id: subKey[0][2],           // The gate id (from your mapped array)
          islocked: false,                 // Set a default value or retrieve from response
          status: '1',                     // Default status (e.g., closed)
          geolocked: geoPermission,        // This determines whether extra buttons are shown in Gate.js
          lat: "0",                        // Replace with actual latitude if available
          lon: "0",                        // Replace with actual longitude if available
        });
        setId(null);
        setvisibleForm(false);
      }
    } catch (error) {
      console.log('Device not added');
      seterrorMsg(error.message);
      setVisible(true);
    }
  };

  const VerifyEmail = async () => {
    try {
      let response = await client.post(`/auth/profile`, { emailid });

      if (response) {
        console.log('User Found');
        setId(response.data.oid);
        setvisibleForm(true); // Show form after successful email verification
      } else {
        seterrorMsg("User not found");
        setVisible(true);
      }
    } catch (error) {
      seterrorMsg(error.message);
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Email Verification Section */}
      {!visibleForm && (
        <View>
          <Text style={styles.text}>Enter the user's email to allocate the gate.</Text>
          <TextInput
            placeholder="Enter User Email"
            value={emailid}
            onChangeText={(text) => setemailId(text)}
            style={styles.input}
          />
          <Button mode='contained' onPress={VerifyEmail} style={styles.button} labelStyle={styles.buttonText}>
            Verify Email
          </Button>
        </View>
      )}

      {/* Gate Selection & Permission Dropdown After Email Verification */}
      {visibleForm && (
        <View>
          <Text style={styles.text}>Select the gate to be allocated to the user:</Text>
          <View style={{ padding: 15, marginBottom: -15 }}>
            <SelectList
              setSelected={(val) => setSubKey([val.split(":")])}
              data={gates}
              save="value"
            />
          </View>

          {/* Geolocation Permission Dropdown Below Gate Selection */}
          <Text style={styles.text}>Geolocation Permission:</Text>
          <View style={{ padding: 15, marginBottom: -15 }}>
            <SelectList
              setSelected={(val) => setGeoPermission(val)}
              data={geoOptions}
              save="value"
            />
          </View>

          <Button mode="contained" onPress={handleAddDevice} style={styles.button} labelStyle={styles.buttonText}>
            Allocate Gate
          </Button>
        </View>
      )}

      <Snackbar visible={visible} onDismiss={() => setVisible(false)}>
        {errorMsg}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 16,
  },
  input: {
    marginVertical: 13,
    fontSize: 17,
    width: "92%",
    height: 50,
    borderWidth: 2,
    borderColor: "#991219",
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    paddingLeft: 17,
    marginBottom: 5,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
    width: "92%",
    height: 45,
    marginLeft: 12,
    borderColor: '#991219',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFD8D6',
  },
  buttonText: {
    color: '#991219',
    fontSize: 16,
  },
  text: {
    marginTop: 10,
    fontSize: 17,
    marginBottom: 7,
    marginLeft: 3,
    fontWeight: "700"
  }
});

export default AddDevice;

