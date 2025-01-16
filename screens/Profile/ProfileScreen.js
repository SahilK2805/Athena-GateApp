import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../connection/authContext';
import client from '../../connection/connectApi';
import getError from '../../connection/getError';

export default function Profile() {
  const { logout, authState } = useAuth();
  const navigation = useNavigation();
  const [net, setNet] = useState(false);
  const [visible, setVisible] = useState(true);
  const [message, setMessage] = useState("");
  const onSetSnackBar = () => setVisible(true);
  const onDismissSnackBar = () => setVisible(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [userData, setUserData] = useState({ email: '', First: '' }); // User data state

  // Simulating user data fetch
  useEffect(() => {
    // Replace this with actual API call to fetch user data
    const id = authState.user_id;
    const getProfile = async () => {
      try {
        const response = await client.get(`/auth/profile/${id}`);
        console.log(response.data.user);
        setUserData(response.data.data);
        setNet(true);
        setIsLoading(false);
        console.log(userData.userType);
      } catch (error) {
        try {
          getError(error);
        } catch (error) {
          console.log('Error:', error.message, "At Profile");
          setNet(false);
          setMessage(error.message);
          onSetSnackBar();
          setIsLoading(false);
        }
      }
    };
    getProfile();
  }, []);

  const handleResetPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const deleteAccount = async () => {
    const id = authState.user_id;
    console.log(id);
    try {
      await client.delete(`/delete/${id}`).then((response) => {
        console.log('Account deleted successfully');
        logout(); // Logout user
        navigation.navigate('Setup', { screen: 'Login' }); // Navigate to Login page
      });
    } catch (error) {
      try {
        getError(error);
      } catch (error) {
        console.log('Error:', error.message, "At Profile");
        setMessage(error.message);
        onSetSnackBar();
      }
    }
  };

  const handleLogoutAccount = () => {
    logout(); // Logout user
    navigation.navigate('Setup'); // Navigate to Login page
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#991218" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 10, width: '100%', backgroundColor: '#000', height: 180, position: 'absolute', top: 0, backgroundColor: '#fedad7' }}></View>

      <View style={{ alignItems: 'center' }}>
        <Image source={require('../../screens/Profile/pic.jpg')} style={styles.profileImage} />
      </View>

      <Text style={styles.username}>Email: {userData.email}</Text>
      <Text style={styles.email}>{userData.userType === "2" ? "User":(userData.userType === '1'? "Admin" : "SuperAdmin")}, {userData.name}</Text>

      <Button mode="contained" style={styles.sharedButton} disabled={!net} onPress={handleResetPassword}>
        <Text style={styles.buttonText}>Reset Password</Text>
      </Button>

      {false && <Button mode="contained" disabled={!net} style={styles.button} onPress={deleteAccount}>Delete Account</Button>}

      <TouchableOpacity onPress={handleLogoutAccount} style={[styles.sharedButton, styles.logoutButton]}>
        <MaterialIcons name="logout" size={24} color="white" />
        <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
      </TouchableOpacity>

      <Snackbar visible={visible} onDismiss={onDismissSnackBar}>
        {message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100000,
    marginTop: -70,
    backgroundColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  sharedButton: {
    marginBottom: 15,
    backgroundColor: '#f6a69b',
    width: '60%',
    paddingVertical: 5,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: 'white',
    paddingVertical:12,
  },
  logoutButtonText: {
    marginLeft: 10,

  },
});