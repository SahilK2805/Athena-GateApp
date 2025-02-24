import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, Switch } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import client from '../../connection/connectApi.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getError from '../../connection/getError.js';
import { useAuth } from '../../connection/authContext.js';
import { SelectList } from 'react-native-dropdown-select-list';

const AddDevice = () => {
  let date = new Date().toJSON();
  const [gateName, setName] = useState('');
  const [emailid, setemailId] = useState(''); // user email ID
  const [userid, setId] = useState(''); // user ID 
  const [subKey, setSubKey] = useState(''); // Subscription key
  const [permission, setPermission] = useState("Give Permission"); // new state for permission selection
  const [visible, setVisible] = useState(false);
  const [visibleForm, setvisibleForm] = useState(false);
  const [errorMsg, seterrorMsg] = useState("");
  const [gates, setGates] = useState("");
  const { authState } = useAuth();
  const navigation = useNavigation();

  // Add new permission states for each toggle
  const [geoPermission, setGeoPermission] = useState(true); // true means geofencing is ON
  const [fullOpenPermission, setFullOpenPermission] = useState(false);
  const [keepOpenPermission, setKeepOpenPermission] = useState(false);
  const [dndPermission, setDndPermission] = useState(false);

  const getGates = async () => {
    let key = authState.user_id;
    try {
      if (key !== null) {
        await client.get(`/gate/${key}`)
          .then((response) => {
            // setRefreshing(false);
            console.log('Response:', response.data.data, 'key:', key);
            let newArray = response.data.data.map((item) => {
              return { key: item.id, value: item.name + ":" + item.subscription + ":" + item.id }
            });
            setGates(newArray);
          })
          .catch((error) => {
            Alert.alert('Error:', error.message);
            console.log('Error:', error);
          });
      }
    }
    catch (error) {
      try {
        getError(error);
      } catch (error) {
        setMessage(error.message);
        onSetSnackBar();
      }
    }
  };

  useEffect(() => {
    getGates();
  }, []);

  const handleAddDevice = async () => {
    try {
        // Check if gate is selected
        if (!subKey || !subKey[0] || !subKey[0][2]) {
            seterrorMsg('Please select the gate');
            setVisible(true);
            return;
        }

        console.log("Adding device with userid:", userid, "gate:", subKey[0][2]);
        let response = await client.post(`/gate/share/${subKey[0][2]}`, {
            id: userid,
        }).catch(
            (error) => {
                console.log('Error:', error.response.data.message);
                if (error.response.data.message === 'PRIMARY must be unique') {
                    seterrorMsg('Gate is already Allocated');
                } else {
                    seterrorMsg(error.response.data.message);
                }
                setVisible(true);
            }
        );

        if (response) {
          // Create unique permission key for this specific user-gate combination
          const permissionKey = `permission_${userid}_${subKey[0][2]}`;
          
          // Create permissions object for this specific gate
          const permissions = {
            geolocation: geoPermission,
            fullOpen: fullOpenPermission,
            keepOpen: keepOpenPermission,
            dnd: dndPermission
          };

          try {
            // Clear any existing permissions for this user-gate combination
            await AsyncStorage.removeItem(permissionKey);
            
            // Store new permissions
            await AsyncStorage.setItem(permissionKey, JSON.stringify(permissions));
            
            // Verify storage
            const storedValue = await AsyncStorage.getItem(permissionKey);
            console.log("Stored permissions for gate", subKey[0][2], ":", storedValue);
            
            if (!storedValue) {
              throw new Error("Permission storage verification failed");
            }
            
            seterrorMsg('Device added successfully');
            setVisible(true);
            setId(null);
            setvisibleForm(false);
          } catch (storageError) {
            console.error("Permission storage error:", storageError);
            seterrorMsg('Error saving permissions');
            setVisible(true);
          }
        }
    } catch (error) {
        console.log('Device not added');
        console.log('error:', error.response?.data?.message || error.message);
        
        // Handle different error cases
        if (error.message === 'Cannot convert undefined value to object') {
            seterrorMsg('Please select the gate to be allocated');
        } else if (error.response?.data?.message === 'PRIMARY must be unique') {
            seterrorMsg('Gate is already Allocated');
        } else {
            seterrorMsg('error: ' + (error.response?.data?.message || error.message));
        }
        setVisible(true);
    }
  };

  const VerifyEmail = async () => {
    try {
      let response = await client.post(`/auth/profile`, { emailid });
      if (response) {
        console.log('User Found');
        setId(response.data.oid);
        setvisibleForm(true);
      } else {
        seterrorMsg("User not found");
        setVisible(true);
      }
    }
    catch (error) {
      try {
        getError(error);
      } catch (error) {
        console.log('User not found');
        seterrorMsg(error.message);
        setVisible(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {!visibleForm && (
        <View>
          <Text style={styles.text}>Enter The user's email to allocate the gate.</Text>
          <TextInput
            placeholder="Enter User Email"
            value={emailid}
            onChangeText={(text) => setemailId(text)}
            style={styles.input}
          />
          <Button mode='contained' onPress={VerifyEmail} style={styles.button} labelStyle={styles.buttonText}>
            VerifyEmail
          </Button>
        </View>
      )}
      {visibleForm && (
        <View style={styles.formContainer}>
          <Text style={styles.text}>Select the gate to be allocated to the user :</Text>
          <View style={{ padding: 15, marginBottom: -15 }}>
            <SelectList
              setSelected={(val) => setSubKey([val.split(":")])}
              data={gates}
              save="value"
            />
          </View>
          {/* Replace dropdown with toggle buttons */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Geolocation</Text>
              <Switch
                value={geoPermission}
                onValueChange={setGeoPermission}
                color="#991219"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Full Open</Text>
              <Switch
                value={fullOpenPermission}
                onValueChange={setFullOpenPermission}
                color="#991219"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Keep Open</Text>
              <Switch
                value={keepOpenPermission}
                onValueChange={setKeepOpenPermission}
                color="#991219"
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>DND</Text>
              <Switch
                value={dndPermission}
                onValueChange={setDndPermission}
                color="#991219"
              />
            </View>
          </View>
          <Button mode="contained" onPress={handleAddDevice} style={styles.button} labelStyle={styles.buttonText}>
            Allocate Gate
          </Button>
        </View>
      )}

      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
      >
        {errorMsg}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-center',
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
  },
  formContainer: {
    padding: 16,
  },
  toggleContainer: {
    marginVertical: 10,
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddDevice;