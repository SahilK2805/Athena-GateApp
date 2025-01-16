import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { SharedElement } from 'react-native-motion';


const CardComponent = ({ gate_id,title,body,status, islocked,geolocked,lat,lon}) => {
  console.log("at card",gate_id,title,body,status,islocked,geolocked,lat,lon);
  const { navigate } = useNavigation();
  return (
    <View style={styles.cardContainer}>
    <Pressable onPress={() => navigate("Gate", { title, gate_id, body, status,islocked,geolocked,lat,lon  })}>
     
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{title}</Title>
            <Paragraph><Text>SubKey: </Text>{body}</Paragraph>
          </Card.Content>
          <View style={styles.statusContainer}>
            <View style={[styles.status, { backgroundColor: status === '2' ? "green":('red')}]} />
          </View>
        </Card>
     
    </Pressable>
  </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    height:100,
    paddingHorizontal:8,
    marginVertical:5,

    justifyContent:"center",
    
    

    
    shadowOffset:{
      width:1,
      height:1,
    },
    backgroundColor:"#FFEBEE",
  },
  cardContainer: {
    padding:3,
  
  },
  title: {
    fontSize: 21,
    fontWeight:"bold",
    marginBottom:8,
    marginTop:-8,
  },
  statusContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1, // Ensure the circle is above other content
  },
  status: {
    width: 25,
    height: 25,
    borderColor:"black",
    borderRadius: 12.5, // Half of width/height for a perfect circle
    marginRight: 15,
    marginTop: 20,
  },
});

export default CardComponent;