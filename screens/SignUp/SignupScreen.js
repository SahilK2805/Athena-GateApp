import React, { useState } from 'react';
import { View, StyleSheet,TextInput,Image } from 'react-native';
import { Text,  Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import client from '../../connection/connectApi';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing pencil icon from react-native-vector-icons
import { Dialog, Portal } from 'react-native-paper'; // Importing components for the popup
import { useAuth } from '../../connection/authContext';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const SignUp = () => {
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

  const handleSignUp = async () => {
    try{
    const userType='2';
    const reg = await register({userType,email,username,password,confirmPassword});
    
    if (reg == true){
      navigation.navigate('Login');
    }
    }catch (error) {
      console.log('Error:',error.message,"At Signup");
      setMessage(error.message);
      setVisible(true);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraHeight={100}
      extraScrollHeight={-100}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={styles.scrollView}
    >
      <StatusBar style="light" />
    <SafeAreaView style={styles.container}>
    <Image
          source={require("./background.png")}
          style={styles.backgroundImage}
        />
        <Animated.Text
          entering={FadeInUp.delay(400).duration(1000)}
          style={styles.SignupText}
        >
          SignUp
        </Animated.Text>
        <Animated.View
          style={styles.TextInput}
          entering={FadeInDown.delay(550).duration(1000)}
        >
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
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
        style={styles.input}
         autoCapitalize="none"
      />
    </Animated.View>
    <Animated.View style={styles.buttons}
         entering={FadeInDown.delay(550).duration(1000)}
        >
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.button}
        disabled={!email || !username || !password || password !== confirmPassword}
      >
        Sign Up
      </Button>
      </Animated.View>

      <Snackbar
          visible={visible}
          onDismiss={onDismissSnackBar}
          style = {styles.snackbar}
          >
          {message}
        </Snackbar>
        </SafeAreaView>
        </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    
   
    padding: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    
    height: 1007,
  },
  backgroundImage: {
    position: "absolute",
    top: 400,
    marginTop: -650,
    width: "100%",
    zIndex: -1,
    resizeMode: "cover",
  },

  Light1: {
    position: "absolute",
    top: -40,
    left: 35,
    width: 90,
    zIndex: -1,
  },
  Light2: {
    position: "absolute",
    left: 70,
    top: -420,
    opacity: 0.8,
    width: 80,
    zIndex: -1,
  },
  SignupText: {
    color: "white",
    fontSize: 33,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily:"Roboto",
    marginTop: -120,
    marginBottom: 70,
  },
  TextInput: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    marginTop: 30,
    fontFamily:"Roboto",
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
    width: "90%",
    height: 50,
    borderWidth: 2,
    borderColor: "#C62828",
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    paddingLeft: 10,
    marginBottom: 5,
  },
  button: {
    marginTop: 10,
    width:"85%",
    height: 40,
    
  },
  buttons: {
    width: '100%',
    alignItems: 'center',
   
  },
  snackbar: {
    position: 'absolute',
    top:-200,
  },
});


export default SignUp;