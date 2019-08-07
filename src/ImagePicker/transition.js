import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableHighlight, ScrollView, Dimensions } from 'react-native';
import { Transitioning, Transition } from 'react-native-reanimated';

function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function getRandomColor() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandom20Colors() {
  let colors = []
  for (let i = 0; i < 20; i++) {
    colors.push({ color: getRandomColor(), uri: `https://loremflickr.com/${i % 2 === 0 ? 300 : 1000}/${500}`, width: i % 2 === 0 ? 300 : 1000, height: 500 })
  }
  return colors
}

const images = getRandom20Colors()

function getOffset(index, expanded) {
  return expanded ? index * 200 : index * 100
}

function Shuffle() {
  const transition = (
    <Transition.Together>
      <Transition.Change interpolation="easeInOut" />
    </Transition.Together>
  );
  

  let [expanded, setExpanded] = useState(false);
  let [offset, setOffset] = useState(0);
  const ref = useRef();
  const scrollRef = useRef()


  return (
    <Transitioning.View
      ref={ref}
      transition={transition}
      style={styles.centerAll}>
      <ScrollView horizontal style={{ left: -offset, width: Dimensions.get('window').width + offset }}>
        {images.map((image, index) => (
          <TouchableHighlight key={String(index)} onPress={() => { ref.current.animateNextTransition(); setOffset(getOffset(index, expanded)); setExpanded(!expanded);}}>
            <View
              style={{ width: expanded ? 200 : 100, height: expanded ? 400 : 100, backgroundColor: image.color }}
            />
          </TouchableHighlight>
        ))}
      </ScrollView>
    </Transitioning.View>
  );
}

const styles = StyleSheet.create({
  centerAll: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  },
  text: {
    backgroundColor: 'purple',
    marginTop: 10,
  },
});

export default Shuffle;