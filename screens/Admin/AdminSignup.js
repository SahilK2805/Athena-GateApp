import React, { useEffect, useState } from 'react';
import { View, StyleSheet , TextInput} from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../connection/authContext';

export default AdminSignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {register} = useAuth();
  const navigation = useNavigation();
  const [message,setMessage] = useState('');
  const [visible, setVisible] = React.useState(false);
  const onToggleSnackBar = () => setVisible(!visible);
  const onDismissSnackBar = () => setVisible(false);

  const handleSignUp = async() => {
    try{
    const userType = "1"
    const reg = await register({userType,email,username,password,confirmPassword});
    if (reg == true) {
      setMessage("Registertion Succeded");
      setVisible(true);
    }
    else {
      setMessage("Registertion Failed");
      setVisible(true);
    }
    }catch (error) {
      console.log('Error:',error.message,"At Signup");
      setMessage(error.message);
      setVisible(true);
    }
  }


  return (
    <View style={styles.container}>
        <Text style = {styles.text}>Fill the below form to Add a new Admin </Text>
      <TextInput
        placeholder="Enter Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.button}
        labelStyle = {styles.buttonText}
        disabled={!email || !username || !password || password !== confirmPassword}
      >
        Sign Up
      </Button>

      <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          action={{
            label: 'Go back',
            onPress: () => {
              navigation.goBack();
            },
          }}
          >
          {message}
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 3,
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
    marginTop:10,
    fontSize: 18,
    marginBottom:10,
    marginLeft:15,
      fontWeight:"600"
  }
});

