import React, { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";

const Splash = ({ navigation }) => {
  useEffect(() => {
    console.log("Splash screen mounted");
    setTimeout(() => {
      console.log("Navigating to Control screen");
      navigation.navigate("Control");
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/IMG-20240411-WA0059-Photoroom.png-Photoroom.png")}
        style={styles.image}
        resizeMode="contain" // Ensure entire image fits without zooming
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "80%", // Use entire width of container
    height: "100%", // Use entire height of container
  },
});

export default Splash;
