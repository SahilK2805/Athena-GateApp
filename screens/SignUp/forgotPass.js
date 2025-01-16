import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Snackbar, Button } from "react-native-paper";
import { useAuth } from "../../connection/authContext";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const ForgotPass = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { forgotpass } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleResetPassword = async () => {
    try {
      const result = await forgotpass({ email, password, confirmPassword });
      if (result === true) {
        setSnackbarMessage("Password reset successful");
        setSnackbarVisible(true);
        navigation.navigate("Login");
      }
    } catch (error) {
      console.log(error.message, "at Reset");
      setSnackbarMessage(error.message);
      setSnackbarVisible(true);
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraHeight={230}
      extraScrollHeight={-300}
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
          style={styles.ResetPassText}
        >
          Reset Password
        </Animated.Text>

        <Animated.View
          style={styles.TextInput}
          entering={FadeInDown.delay(550).duration(1000)}
        >
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            style={styles.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              style={styles.pass}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.ConfirmpasswordContainer}>
            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              style={styles.Confirmpass}
              autoCapitalize="none"
            />
          </View>
        </Animated.View>
        <Animated.View
          style={styles.buttons}
          entering={FadeInDown.delay(550).duration(1000)}
        >
          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            disabled = {!email||!password||!confirmPassword}
          >
            Reset Password
          </Button>
        </Animated.View>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style = {styles.snackbar}
        >
          {snackbarMessage}
        </Snackbar>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
    height: 1007,
  },
  scrollView: {
    flex: 1,
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
    top: -50,
    left: 35,
    width: 90,
    zIndex: -1,
  },
  Light2: {
    position: "absolute",
    left: 70,
    top: -470,
    opacity: 0.8,
    width: 80,
    zIndex: -1,
  },
  ResetPassText: {
    color: "white",
    fontSize: 33,
    fontWeight: "bold",
    letterSpacing: 1,
    fontFamily:"Roboto",
    marginTop: -180,
    marginBottom: 110,
  },

  TextInput: {
    width: "100%",
    padding: 10,
    alignItems: "center",
    marginTop: 30,
    fontFamily:"Roboto",
  },
  email: {
    fontSize: 17,
    width: "90%",
    height: 50,
    borderWidth: 2,
    borderColor: "#C62828",
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    paddingLeft: 10,
    marginBottom: 17,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 50,
    borderWidth: 2,
    borderColor: "#C62828",
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    paddingLeft: 10,
    marginBottom: 17,
  },
  ConfirmpasswordContainer:{
    width:'90%',
    fontSize: 17,
    width: "90%",
    height: 50,
    borderWidth: 2,
    borderColor: "#C62828",
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
    paddingLeft: 10,
    marginBottom: 17,
  },
  Confirmpass: {
    fontSize:17,
   
    flex: 1,
  },
  pass: {
    fontSize: 17,
    flex: 1,
  },
  visibilityToggle: {
    padding: 10,
  },
  buttons: {
    width: "90%",
    alignItems: "center",
  },
  button: {
    width: "94%",
    height: 45,
    fontSize: 16,
  },
 

  snackbar: {
    position: "absolute",
    bottom: 0,
    width: "200%",
    height: "500%",
  },
  snackbar: {
    position: 'absolute',
    top:-200,
  },
});

export default ForgotPass;
