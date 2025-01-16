
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./navigator/TabNavigator";
import {MD3LightTheme ,PaperProvider} from "react-native-paper";
import { LoginStackNavigator } from "./navigator/StackNavigator";
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from "./connection/authContext";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SharedElementRenderer } from "react-native-motion";


SplashScreen.preventAutoHideAsync();

const theme={
  ...MD3LightTheme,
    "colors": {
      "primary": "rgb(186, 26, 32)",
      "onPrimary": "rgb(255, 255, 255)",
      "primaryContainer": "rgb(255, 218, 214)",
      "onPrimaryContainer": "rgb(65, 0, 3)",
      "secondary": "rgb(119, 86, 83)",
      "onSecondary": "rgb(255, 255, 255)",
      "secondaryContainer": "rgb(255, 218, 214)",
      "onSecondaryContainer": "rgb(44, 21, 19)",
      "tertiary": "rgb(114, 91, 46)",
      "onTertiary": "rgb(255, 255, 255)",
      "tertiaryContainer": "rgb(254, 222, 166)",
      "onTertiaryContainer": "rgb(38, 25, 0)",
      "error": "rgb(186, 26, 26)",
      "onError": "rgb(255, 255, 255)",
      "errorContainer": "rgb(255, 218, 214)",
      "onErrorContainer": "rgb(65, 0, 2)",
      "background": "rgb(255, 251, 255)",
      "onBackground": "rgb(32, 26, 25)",
      "surface": "rgb(255, 251, 255)",
      "onSurface": "rgb(32, 26, 25)",
      "surfaceVariant": "rgb(245, 221, 219)",
      "onSurfaceVariant": "rgb(83, 67, 66)",
      "outline": "rgb(133, 115, 113)",
      "outlineVariant": "rgb(216, 194, 191)",
      "shadow": "rgb(0, 0, 0)",
      "scrim": "rgb(0, 0, 0)",
      "inverseSurface": "rgb(54, 47, 46)",
      "inverseOnSurface": "rgb(251, 238, 236)",
      "inversePrimary": "rgb(255, 179, 172)",
      "elevation": {
        "level0": "transparent",
        "level1": "rgb(252, 240, 244)",
        "level2": "rgb(250, 233, 237)",
        "level3": "rgb(247, 226, 231)",
        "level4": "rgb(247, 224, 228)",
        "level5": "rgb(245, 220, 224)",
        "level6": "rgb(242, 214, 218)",
        "level7": "rgb(240, 209, 213)",
        "level8": "rgb(238, 204, 208)",
        "level9": "rgb(235, 198, 202)",
        "level10": "rgb(233, 192, 197)"
      },
      "surfaceDisabled": "rgba(32, 26, 25, 0.12)",
      "onSurfaceDisabled": "rgba(32, 26, 25, 0.38)",
      "backdrop": "rgba(59, 45, 44, 0.4)",
      "backgroundColor": "rgb(120, 69, 172)",
      "onBackgroundColor": "rgb(255, 255, 255)",
      "backgroundColorContainer": "rgb(240, 219, 255)",
      "onBackgroundColorContainer": "rgb(44, 0, 81)"
    }
  }
  

const EntryStack = createStackNavigator();
 const AppLayout = () => {
  const {authState} = useAuth();

  return (
 
    <PaperProvider theme={theme}>
      <SharedElementRenderer>
    <NavigationContainer>
    
      <EntryStack.Navigator screenOptions={{headerShown: false}}>
        {authState ?.authtenticated ? ( 
          <EntryStack.Screen name="Control" component={BottomTabNavigator}/> 
        ) 
        :(
          <EntryStack.Screen name="Setup" component={LoginStackNavigator}/>
        )}
        </EntryStack.Navigator>
    </NavigationContainer>
    </SharedElementRenderer>
  
    </PaperProvider>
  
    

  );
}
const App = () => {
  const [isLoaded] = useFonts({
    "poppins-regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "poppins-bold": require("./assets/fonts/Poppins-Bold.ttf"),
  });

  if(isLoaded){
    setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 2000);
  }

  return (

    <AuthProvider>   
      <AppLayout />
    </AuthProvider>
  );
}
export default App;