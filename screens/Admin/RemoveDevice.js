import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Menu, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MultipleSelectList } from 'react-native-dropdown-select-list'
import { useAuth } from '../../connection/authContext';
import client from '../../connection/connectApi';
import getError from '../../connection/getError';

const RemoveDevice = () => {
  const [deviceToRemove, setDeviceToRemove] = useState('');
  const [gates, setGates] = useState([]);
  const {authState} = useAuth();
  const navigation = useNavigation(); 
  const [selected, setSelected] = React.useState([]);


  let key = authState.user_id;
  useEffect(() => {
    const getGates= async()=>{
    const response = await client.get(`/gate/${key}`);
    let newArray = response.data.data.map((item) => {
      return {key: item.id, value: item.name+":"+item.subscription}
    })
    setGates(newArray)
    }
    getGates();
  },[]);

  const deleteDevice = async(id,gatename)=>{
    try{
      console.log('Deleting Device:', id);
      const response = await client.delete(`/gate/${id}`)
      console.log(response);
      if (response.status==200){
        Alert.alert("Removed: ", String(gatename));
        navigation.goBack();
        console.log(navigation.getState());
      }
    }catch(error){
      try{
        getError(error);
      }
      catch(error){
        console.log('Error:',error.message,"At RemoveDevice");
      }
    }
    // setrefresh(!refresh);
  }

  const handleRemoveDevice = () => {
    // console.log('Removing Device:', deviceToRemove);
    // Your remove device logic goes here
    for (let i = 0; i < selected.length; i++) {
      const found = gates.find(element => element.key == selected[i]);
      console.log('Removing Device:', found.value);
      deleteDevice(selected[i],found.value);
    }
  };

  return (    
    <View style={styles.container}>
        <MultipleSelectList 
        setSelected={(val) => setSelected(val)} 
        data={gates}
        save="key"
        />
      <Button mode="contained" onPress={handleRemoveDevice} style={styles.button} labelStyle={styles.buttonText}>
        Remove Device
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 30,
  },
  button: {
    marginTop: 10,
    width:"100%",
    height: 45,
    
   
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
  }
});

export default RemoveDevice;
