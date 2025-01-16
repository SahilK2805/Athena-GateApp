import React, { useState } from 'react';
import { View, StyleSheet, Alert ,TextInput} from 'react-native';
import { Text, Portal, Dialog, Snackbar,Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import client from '../../connection/connectApi.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getError from '../../connection/getError.js';

const NewDevice = () => {
  let date = new Date().toJSON();
  const [gateName, setName] = useState('');
  const [subKey, setSubKey] = useState(''); // Subscription key
  const [visible, setVisible] = React.useState(false);
  const [visibleForm, setvisibleForm] = useState(false);
  const [errorMsg, seterrorMsg] = useState("");
  const navigation = useNavigation();


  const handleAddDevice = async () => {
    try{
    let response = await client.post(`/gate`,{
      name:gateName,
      subscription:subKey,
    })

    if (response){
      console.log('Response:',response.data.gate_id);
      AsyncStorage.setItem(`gateStatus${response.data.gate_id}`, '0');
      seterrorMsg('Device added successfully');
      setVisible(true);
      setvisibleForm(false)
    }

    }catch(error){
      console.log('Device not added');
      console.log('error:',error.response.data.message);
      seterrorMsg('error:',error.response.data.message);
      setVisible(true);
    }
    navigation.goBack(); // Change 'Welcome' to the screen you want to navigate to after sign-up
  };

  return (
    <View style={styles.container}>
      <View>
      <Text style= {styles.text}>Enter the Device Details</Text>
      <TextInput
        placeholder="Enter Device Name"
        value={gateName}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Enter Device Subscription Key"
        value={subKey}
        onChangeText={(text) => setSubKey(text)}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleAddDevice} style={styles.button} labelStyle={styles.buttonText} >
        Create Gate
      </Button>
      </View>

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
    paddingLeft: 10,
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
    marginTop:20,
    fontSize: 19,
    marginBottom:10,
    marginLeft:15,
    fontWeight:"600"
  }
});

export default NewDevice;