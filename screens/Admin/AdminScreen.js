import React from 'react';
import { View, StyleSheet ,Text} from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../connection/authContext';
import { AntDesign } from '@expo/vector-icons';

const Admin = () => {
  const navigation = useNavigation();
  const { authState } = useAuth();
  console.log("type:", authState.type)

  const handleAddDevice = () => {
    navigation.navigate('Allocate Gate');
  };

  const handleNewDevice = () => {
    navigation.navigate('Create New Gate');
  };

  const handleRemoveDevice = () => {
    navigation.navigate('RemoveDevice');
  };
  const handleAdminSignup = () => {
    navigation.navigate('AdminSignUp');
  }
  const handleSetLocation = () => {
    navigation.navigate('SetLocation');
  };

  const handleAddUser = () => {
    navigation.navigate('RemoveUser');
  };
  const ShareDevice = () => {
    navigation.navigate('ShareDevice'); 
  };
  return (
    <View style={styles.container}>
      { authState.type === "0" &&
      <Button mode="contained" style={styles.button} onPress={handleNewDevice} labelStyle={styles.buttonText}>
        Create New Gate
      </Button>
      }
      {authState.type <= '1' &&
       <View style ={{width:'100%',marginLeft:77}}>
      <Button mode="contained" style={styles.button} onPress={handleAddDevice} labelStyle={styles.buttonText}>
        Allocate Gate
      </Button>

      <Button mode="contained" style={styles.button} onPress={handleSetLocation} labelStyle={styles.buttonText}>
        Set Location For Gates
      </Button>
      </View>
      
      }
      { authState.type === "0" &&
            <Button mode="contained" style={styles.button} onPress={handleAdminSignup} labelStyle={styles.buttonText}>
              Add Admin
            </Button>
      }
      <Button mode="contained" style={styles.button} onPress={ShareDevice} labelStyle={styles.buttonText}>
        Share Device
      </Button>

      <Button mode="contained" style={styles.button} onPress={handleRemoveDevice} labelStyle={styles.buttonText} >
        Remove Device
      </Button>

      {authState.type < "2" &&
      <Button mode="contained" style={styles.button} onPress={handleAddUser} labelStyle={styles.buttonText}>
        Remove User Gate
      </Button>
      }
    </View>
  );
};

export default function AdminScreen() {
  return <Admin />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  Cicon:{
   marginRight: 10,
  },
  button: {
    marginVertical: 10,
    width: '80%',
    borderColor: '#991219',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor:"#FFEBEE",
        justifyContent:"center",
        alignContent:"center",
        
  },
  buttonText: {
    color: '#991219',
    fontSize:16,
    
   
    
  },
});
