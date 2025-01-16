import React, { useState } from 'react';
import { View, StyleSheet, Image, Text, TextInput, TouchableOpacity } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../connection/authContext';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState('');

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  

  const { login, authState } = useAuth();
  const navigation = useNavigation();

  const fetchToken = async (username, password) => {
    try {
      const result = await login({ username, password });
      if (authState.authenticated === true) {
        navigation.navigate('Control');
      }
    } catch (error) {
      setMessage(error.message);
      console.log('Error:', error.message);
      setSnackbarVisible(true);
    }
  };

  const handleLogin = async () => {
    fetchToken(username, password);
  };

  const handleSignUpSwitch = () => {
    navigation.navigate('SignUp');
  };

  const handlePassSwitch = () => {
    navigation.navigate('ResetPassword');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  
  const onDismissSnackBar = () => setSnackbarVisible(false);
  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraHeight={100}
      extraScrollHeight={-300}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='handled'
      style={styles.scrollView}
    >
      <StatusBar style='light' />
      <SafeAreaView style={styles.container}>
        <Image
          source={require('./background.png')}
          style={styles.backgroundImage}
        />
        <Animated.View 
          entering={FadeInUp.delay(500).duration(1000)}
          style={styles.logo}
        >
          <Image
            source={require('./splash.png')}
            style={styles.image}
            resizeMode='contain'
          />
        </Animated.View>
        <Animated.View style={styles.TextInput}
         entering={FadeInDown.delay(550).duration(1000)}
        >
          <TextInput
           
            placeholder="Email"
            value={username}
            onChangeText={(text) => setUsername(text)}
            style={styles.email}
         
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={!isPasswordVisible}
              style={styles.pass}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.visibilityToggle}>
              <Text>{isPasswordVisible ? "Hide" : "Show"}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        <Animated.View style={styles.buttons}
         entering={FadeInDown.delay(550).duration(1000)}
        >
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            disabled={!username || !password}
          >
            Login
          </Button>
          <Text style={styles.switchText1}>
            Don't have an account? <Text style={styles.switchLink} onPress={handleSignUpSwitch}>Sign Up</Text>
          </Text>
          {false &&
          <Text style={styles.switchText}>
            Forgot password? <Text style={styles.switchLink} onPress={handlePassSwitch}>Reset Password</Text>
          </Text>
          }
        </Animated.View>
        <Snackbar
         visible={snackbarVisible}
         onDismiss={onDismissSnackBar}
          duration={Snackbar.DURATION_SHORT}
          style={styles.snackbar}
        >
          {message}
        </Snackbar>
      
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    height:1007,
  },
  scrollView: {
    flex: 1,
  },
  backgroundImage: {
    position:"absolute",
    top:400,
   marginTop:-660,
    width: '100%',
    zIndex:-1,
    resizeMode: 'cover',
  },
  Light1: {
    position: 'absolute',
    top: -30,
    left: 35,
    width: 90,
    zIndex:-1,
  },
  Light2: {
    position: 'absolute',
    left: 70,
    top: -440,
    opacity: 0.8,
    width: 80,
    zIndex:-1,
  },
  LoginText: {
    color: 'white',
    fontSize: 33,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: 'poppins-regular',
    marginTop:-145,
    marginBottom:75,
   
  },
  logo: {
    alignItems: 'center',
    marginBottom:10,
    
  },
  image: {
    width: 300,
    height: 100,
  },
  TextInput: {
    width: '100%',
    padding: 10,
    alignItems: 'center',
    fontFamily:"Roboto",
  },
  email: {
    fontSize: 17,
    width: '90%',
    height: 50,
    borderWidth: 2,
    borderColor: '#C62828',
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    paddingLeft: 10,
    marginBottom:17,
    
    
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    borderWidth: 2,
    borderColor: '#C62828',
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
    paddingLeft: 10,
    marginBottom:17,
  },
  pass: {
    fontSize: 17,
    flex: 1,
  },
  visibilityToggle: {
    padding: 10,
  },
  buttons: {
    width: '90%',
    alignItems: 'center',
   
  },
  button: {
    width: '94%',
    height: 45,
    fontSize: 16,
    marginTop:8,
    fontFamily:"Roboto",
  },
  switchText1: {
    marginTop:10,
    textAlign: 'center',
  },
  switchText: {
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
    fontFamily:"Roboto",
  },
  switchLink: {
    color: 'blue',
    textDecorationLine: 'underline',
    
  },
  
    snackbar: {
      position: 'absolute',
      top:-200,
    },
   
  
});

export default Login;
