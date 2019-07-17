// @ts-check
import React from 'react'
import {
  StyleSheet,
  View,
  CameraRoll,
  Dimensions
} from 'react-native'
import * as helpers from '../ReanimatedHelpers'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler'

/**
 * @typedef {Object} ImagePickerProps
 * @property {number} cellSideSize
 * @property {number} expandedCellSideSize
 * @property {number} cellMargin 
 */

const {width} = Dimensions.get('window')
const pickerWidth = width * 4
const containerWidth = width

const translationX = new Animated.Value(0)
const velocityX = new Animated.Value(0)
const state = new Animated.Value(GestureState.UNDETERMINED)
const gestureHandler = helpers.eventHandler({
  translationX,
  velocityX,
  state
})

const translateX = helpers.interaction(
  translationX,
  state,
  velocityX,
  pickerWidth,
  containerWidth
)

const ImagePicker = () => {
  return (
    <PanGestureHandler failOffsetX={width} {...gestureHandler}>
        <Animated.View style={{flex: 1,backgroundColor: 'red', justifyContent: 'center'}}>
          <Animated.View style={[styles.picker, { transform: [ { translateX: translateX } ] }]}>
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  picker: {
    backgroundColor: 'skyblue',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: pickerWidth,
    height: 80
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

export default ImagePicker