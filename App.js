import React from 'react';
import { StyleSheet, View } from 'react-native';
import ImagePicker from './src/ImagePicker'


export default function App() {
  return (
    <View style={styles.container}>
      <ImagePicker />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
