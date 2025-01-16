import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Snackbar, TextInput, Button } from 'react-native-paper';
import { useAuth } from '../../connection/authContext';
import { useNavigation } from '@react-navigation/native';


const ResetPassword = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {forgotpass}  = useAuth();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handleResetPassword =async () =>{
        try{
            const result = await forgotpass({email, password, confirmPassword});
            if (result===true){
                setSnackbarMessage('Password reset successful');
                setSnackbarVisible(true);
                navigation.navigate("Login");
            }
        }catch(error){
            console.log(error.message,"at Reset");
            setSnackbarMessage(error.message);
            setSnackbarVisible(true);
        }
    }

    return (
        <View>
            <TextInput
                label="Email"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
            />
            
            <TextInput
                label="Password"
                secureTextEntry
                value={password}
                onChangeText={text => setPassword(text)}
                style={styles.input}
            />
            <TextInput
                label="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={text => setConfirmPassword(text)}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleResetPassword} style={styles.button} >
                Reset Password
            </Button>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                {snackbarMessage}
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
      marginVertical: 15,
    },
    button: {
      marginTop: 16,
    },
  });
export default ResetPassword;