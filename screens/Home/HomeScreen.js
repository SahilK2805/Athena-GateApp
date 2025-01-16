import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import client from '../../connection/connectApi.js';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import CardComponent from './CardComponent';
import { useAuth } from '../../connection/authContext';
import getError from '../../connection/getError.js';
import { useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-native-motion';
import { useFocusEffect } from '@react-navigation/native';


const HomeScreen = () => {
    const [gates, setGates] = useState([]);
    const {authState, logout} = useAuth();  
    const [refreshing, setRefreshing] = useState(true);
    const [visible, setVisible] = React.useState(true);
    
    const [message,setMessage] = useState("Pull Down to refresh");
    const onSetSnackBar = () => setVisible(true);
    const onDismissSnackBar = () => setVisible(false);
  const nav = useNavigation();

    useEffect(()=>{
        getGates();
    },[]);
    useFocusEffect(
      useCallback(() => {
        getGates();
      }
    , [])
    );

    //unify getGates
    const getGates = async () => {
      let key = authState.user_id;
      console.log(authState)
      try {
          if (key !== null) {
              const response = await client.get(`/gate/${key}`)
              setRefreshing(false);
              console.log('Response:', response.data.data, 'key:', key);
              setGates(response.data.data);
              if (!response.data.data){
                setMessage("You Have No Gates");
                onSetSnackBar();
              }
            }
          else{
              Alert.alert('User Not Found',"Your account does not exist");
              logout();
              nav.navigate("Setup",{screen:"Login"});
          }
      } catch (error) {
        try{
          getError(error);
        }catch(error){
          setMessage(error.message);
          onSetSnackBar();
          setRefreshing(false);
        }
      }
  }
    return (
        <View style={styles.container}>
            {refreshing ? <ActivityIndicator /> : null}
          <FlatList
            data={gates}
            renderItem={({ item }) => (
              <CardComponent gate_id={item.id} title={item.name} body={item.subscription} status={item.status} islocked={item.locked} geolocked={item.geolocked} lat={item.locationLat} lon={item.locationLon} />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={getGates} />
            }
            />
          <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          >
            {message}
        </Snackbar>
        </View>

       
    );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingTop:10,
    },
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
    },
    cardContainer: {
      marginTop: 16,
    },
    card: {
      margin:3,
      padding:10,
    },
  });

export default HomeScreen;