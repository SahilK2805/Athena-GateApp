import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert,TextInput, } from 'react-native';
import { Text, Button,Portal, Dialog, Snackbar } from 'react-native-paper';
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
  const [visible, setVisible] = React.useState(false);
  const [visibleForm, setvisibleForm] = useState(false);
  const [errorMsg, seterrorMsg] = useState("");
  const [gates, setGates] = useState("");
  const {authState} = useAuth();
  const navigation = useNavigation();

  const getGates = async () => {
    let key = authState.user_id;
    try {
        if (key !== null) {
            await client.get(`/gate/${key}`)
            .then((response) => {
                // setRefreshing(false);
                console.log('Response:', response.data.data, 'key:', key);
                let newArray = response.data.data.map((item) => {
                    return {key: item.id, value: item.name+":"+item.subscription+":"+item.id}
                })
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
}

useEffect(() => {
    getGates();
}, []);

  const handleAddDevice = async () => {
    console.log('Device Name:', subKey);
    try{
      console.log("Key",subKey[0][2],authState.user_id,userid);
    let response = await client.post(`/gate/share/${subKey[0][2]}`,{
      id:userid,
    }).catch(
      (error) => {
        console.log('Error:',error.response.data.message);
        seterrorMsg(error.response.data.message);
        setVisible(true);
      }
    )

    if (response){
      // console.log('Response:',response.data.gate_id);
      // AsyncStorage.setItem(`gateStatus${response.data.gate_id}`, '0');
      seterrorMsg('Device added successfully');
      setVisible(true);
      setId(null);
      setvisibleForm(false)
    }

    }catch(error){
      console.log('Device not added');
      console.log('error:',error.response.data.message);
      seterrorMsg('error:',error.response.data.message);
      setVisible(true);
    }
    // navigation.replace('Home');
  };
  const VerifyEmail = async () => {
    
    try{
      let response = await client.post(`/auth/profile`,{emailid})

      if(response){
        console.log('User Found');
        setId(response.data.oid);
        setvisibleForm(true)
      }
      else{
        seterrorMsg("User not found");
        setVisible(true);
      }
    }
    catch(error){
      try{
        getError(error);
      }catch(error){
      console.log('User not found');
      seterrorMsg(error.message);
      setVisible(true);
      }
    }
  }

  return (
    <View style={styles.container}>
      {!visibleForm && <View>
        <Text style={styles.text}>Enter The user's email to allocate the gate.</Text>
      <TextInput
        placeholder="Enter User Email"
        value={emailid}
        onChangeText={(text) => setemailId(text)}
        style={styles.input}
      />
      <Button mode='contained' onPress={VerifyEmail} style={styles.button} labelStyle={styles.buttonText}>VerifyEmail</Button>
      </View>
      }
      {visibleForm &&<View >
        <Text style={styles.text}>Select the gate to be allocated to the user :</Text>
        <View style={{padding:15,marginBottom:-15}}>
      <SelectList 
            setSelected={(val) => setSubKey([val.split(":")])} 
            data={gates}
            save="value"
          
      />
       </View>
        
      <Button mode="contained" onPress={handleAddDevice} style={styles.button} labelStyle={styles.buttonText}>Allocate Gate</Button>
    </View>
      }

      <Snackbar
        visible={visible}
        onDismiss={setVisible[false]}
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
    marginLeft:12,
  },
  button: {
    marginTop: 16,
    width:"92%",
    height: 45,
    
    marginLeft:12,
    borderColor: '#991219',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor:'#FFD8D6',
 
  },
  buttonText: {
    color: '#991219',
    fontSize:16,
    
   
    
  },
  text:{
    marginTop:10,
    fontSize: 17,
    marginBottom:7,
    marginLeft:3,
    fontWeight:"700"
  }
});

export default AddDevice;
