import AsyncStorage from '@react-native-async-storage/async-storage';
const storeData = async (value) => {
    try {
      console.log('Saved Value:', value)
      await AsyncStorage.setItem('my-key', value.toString());
    } catch (e) {
      // saving error
      console.log('Error:', e);
    }
};
const getData = async () => {
    try {
      value = await AsyncStorage.getItem('my-key');
      console.log('Values:', value);
      return value;
    } catch (e) {
      // error reading value
      console.log('Error:', e);
    }
  };
export {storeData,getData }