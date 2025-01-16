import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from "@react-navigation/stack";
import { Platform } from "react-native";
import HomeScreen from "../screens/Home/HomeScreen";
import Profile from "../screens/Profile/ProfileScreen";
import Admin from "../screens/Admin/AdminScreen";
import Login from "../screens/Login/LoginScreen";
import Gate from "../screens/Home/Gate";
import RemoveDevice from "../screens/Admin/RemoveDevice";
import SignUp from '../screens/SignUp/SignupScreen';
import RemoveUser from "../screens/Admin/RemoveUser";
import ResetPassword from "../screens/Profile/ResetPassword";
import ForgotPass from "../screens/SignUp/forgotPass";
import ShareDevice from "../screens/Admin/ShareDevice";
import AddDevice from "../screens/Admin/AddDevice";
import NewDevice from "../screens/Admin/NewDevice";
import AdminSignUp from "../screens/Admin/AdminSignup";
import SetLocation from "../screens/Admin/SetLocation";

const Stack = createStackNavigator();

const screenOptionStyle = {
  headerStyle: {
    backgroundColor: "#991218",
  },
  headerTintColor: "white",
  headerBackTitle: "Back",
};

const LoginStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
      <Stack.Screen name="Login" component={Login} options={{headerShown : false}} />
      <Stack.Screen name="SignUp" component={SignUp} options={{headerShown : false}} />
      <Stack.Screen name="ResetPassword" component={ForgotPass} options={{headerShown : false}} />
    </Stack.Navigator>
  );
};

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
     <Stack.Screen 
        name="Athena Automation" 
        component={HomeScreen}
        options={{
          headerStyle: {
            backgroundColor: '#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing:0,
            color:"black",


          },
        }}
      />
     <Stack.Screen 
        name="Gate" 
        component={Gate}
        options={{
          headerStyle: {
            backgroundColor: '#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight: '600',
            letterSpacing:0,
            color:"black",
            fontSize:22,


          },
        }}
      />
    </Stack.Navigator>
  );
}
const AdminStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
      <Stack.Screen 
        name="Athena Automation" 
        component={Admin}
        options={{
          headerStyle: {
            backgroundColor: '#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing:0,
            color:"black",


          },
        }}
      />
      <Stack.Screen name="ShareDevice" component={ShareDevice} options={{
          headerStyle: {
            backgroundColor: '#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing:0,
            color:"black",


          },
        }}/>
      <Stack.Screen name="RemoveDevice" component={RemoveDevice} 
      options={{
        headerStyle: {
          backgroundColor: '#fedad7', 
          height:65,
        
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 4, 
            },
          }),
        },
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing:0,
          color:"black",


        },
      }} />
      <Stack.Screen name="Allocate Gate" component={AddDevice} 
      options={{
        headerStyle: {
          backgroundColor: '#fedad7', 
          height:65,
        
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 4, 
            },
          }),
        },
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing:0,
          color:"black",


        },
      }}/>
      <Stack.Screen name="SetLocation" component={SetLocation} 
      options={{
        headerStyle: {
          backgroundColor: '#fedad7', 
          height:65,
        
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 4, 
            },
          }),
        },
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing:0,
          color:"black",


        },
      }}/>
      <Stack.Screen name="RemoveUser" component={RemoveUser} 
      options={{
        headerStyle: {
          backgroundColor: '#fedad7', 
          height:65,
        
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 4, 
            },
          }),
        },
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing:0,
          color:"black",


        },
      }}/>
      <Stack.Screen name="Create New Gate" component={NewDevice}
      options={{
        headerStyle: {
          backgroundColor: '#fedad7', 
          height:65,
        
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
            },
            android: {
              elevation: 4, 
            },
          }),
        },
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing:0,
          color:"black",


        },
      }} />
      <Stack.Screen name="AdminSignUp" component={AdminSignUp} options={{
          headerStyle: {
            backgroundColor: '#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight: '700',
            letterSpacing:0,
            color:"black",


          },
        }} />
    </Stack.Navigator>
  );
}

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptionStyle}>
     <Stack.Screen 
        name="Profile" 
        component={Profile}
        options={{
          headerStyle: {
            backgroundColor:'#fedad7', 
            height:65,
          
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
              },
              android: {
                elevation: 4, 
              },
            }),
          },
          headerTitleStyle: {
            fontWeight:'bold',
           fontSize:22,
            color:"white",


          },
        }}
      />
      <Stack.Screen name="ResetPassword" component={ForgotPass} options={{headerShown : false}} />
    </Stack.Navigator>
  );
}


export { MainStackNavigator, ProfileStackNavigator,AdminStackNavigator,LoginStackNavigator };