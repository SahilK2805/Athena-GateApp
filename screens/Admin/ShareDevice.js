import React, { useEffect, useState } from "react";
import { Button, Snackbar } from "react-native-paper";
import client from "../../connection/connectApi";
import { Alert, View, StyleSheet, Share } from "react-native";
import { useAuth } from "../../connection/authContext";
import { SelectList } from "react-native-dropdown-select-list";

const ShareDevice = () => {
const [message, setMessage] = useState("");
const [visible, setVisible] = React.useState(true);
const onSetSnackBar = () => setVisible(true);
const onDismissSnackBar = () => setVisible(false);
const [gates, setGates] = useState([]);
const [selected,setSelected] = useState([]);
const {authState} = useAuth();
const address = process.env.EXPO_PUBLIC_API_URL;

const getGates = async () => {
    let key = authState.user_id;
    try {
        if (key !== null) {
            await client.get(`/gate/${key}`)
            .then((response) => {
                console.log('Response:', response.data.data, 'key:', key);
                let newArray = response.data.data.map((item) => {
                    return {key: item.id, value: item.subscription}
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

const onShare = async (link) => {
    try {
      const result = await Share.share({
        message:link,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };



const shortenUrl = async (longUrl) => {
  try {
      const modifiedUrl = longUrl + "?ref=Athena-Automation"; // Append identifier
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(modifiedUrl)}`);
      if (!response.ok) throw new Error('URL shortening failed');
      return await response.text();
  } catch (error) {
      console.error('Error shortening URL:', error);
      return longUrl;
  }
};


const GenerateLink = async () => {
    getGates();
    console.log('Generating link...');
    
    try {
        const response = await client.post('/share/token', {
            sub: selected,
        });
        
        if (response.status === 200) {
            const longLink = `http://${address}/api/v1/share/${response.data.token}`;
            // Get shortened URL
            const shortLink = await shortenUrl(longLink);
            console.log('Shortened Link:', shortLink);
            
            // Create a message with the shortened link
            const message = `Here's your gate access link: ${shortLink}`;
            onShare(message);
        }
    } catch (error) {
        Alert.alert('Error: unable to share device', error.message);
        console.log('Error:', error);
    }
};

    return (
        <View style={styles.container}>
            <SelectList 
            setSelected={(val) => setSelected(val)} 
            data={gates} 
            save="value"
            />
            <Button mode="contained" onPress={() => GenerateLink()} style={styles.button } labelStyle={styles.buttonText}
              disabled = {!selected}>
            Share Gate
            </Button>
            <Snackbar
            visible={visible}
            onDismiss={onDismissSnackBar}
            >
                {message}
            </Snackbar>
        </View>
    );
    }
    const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'flex-center',
          padding: 30,
        },
        SelectList: {
          margin: 25,
        },
        button: {
          marginTop: 19,
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
      });
    
export default ShareDevice;