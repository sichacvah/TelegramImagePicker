import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated'
import SpringConfig from 'react-native-reanimated/src/SpringConfig'
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler'

const {
  set,
  cond,
  eq,
  Value,
  event,
  Clock,
  stopClock,
  add,
  sub,
  decay,
  clockRunning,
  startClock,
  block,
  divide,
  debug,
  multiply,
  neq,
  greaterThan,
  spring,
  lessThan,
  and
} = Animated
const translationX = new Value(0)
const velocityX = new Value(0)
const state = new Value(GestureState.UNDETERMINED)
const clock = new Clock()
const position = new Value(0)

const {width} = Dimensions.get('window')
const pickerWidth = width * 2

function runDecay(position, velocity) {
  const clock = new Clock()
  const state = {
    finished: new Value(0),
    velocity: velocity,
    position: position,
    time: new Value(0),
  }

  const config = {
    deceleration: 0.998
  }
  return block([
    cond(clockRunning(clock), 0, startClock(clock)),
    decay(clock, state, config),
    state.position,
  ])
}

function runSpring(position, value) {
  const config = {
    damping: 28,
    mass: 0.3,
    stiffness: 188.296,
    overshootClamping: false,
    toValue: value,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  };

  const clock = new Clock();

  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: position,
    time: new Value(0),
  }
  return block([
    cond(clockRunning(clock), 0, startClock(clock)),
    spring(clock, state, config),
    state.position,
  ])
}

const start = new Value(0)
const drag = (translation) => {
  const rightPoint = width < pickerWidth ? width - pickerWidth : 0
  return block([
    cond(
      eq(state, GestureState.ACTIVE),
      [
        set(position, add(position, sub(translation, start))),
        set(start, translation),
      ],
      [
        set(start, 0),
        cond(lessThan(0, position), [
          set(position, runSpring(position, new Value(0)))
        ]),
        cond(greaterThan(rightPoint, position), [
          set(position, runSpring(position, new Value(rightPoint)))
        ]),
        cond(and(greaterThan(0, position), lessThan(rightPoint, position)), [
          set(position, runDecay(position, velocityX))
        ])
      ]
    )
  ])
}


const prevState = new Value(GestureState.UNDETERMINED)

class ImagePicker extends React.PureComponent {

  eventHandler = event([{
    nativeEvent: {
      translationX,
      velocityX,
      state
    }
  }])

  translateX = block([
    drag(translationX),
    position
  ])

  render() {
    return (
      <PanGestureHandler onHandlerStateChange={this.eventHandler} onGestureEvent={this.eventHandler}>
        <Animated.View style={{flex: 1,backgroundColor: 'red', justifyContent: 'center'}}>
          <Animated.View style={[styles.picker, { transform: [ { translateX: this.translateX } ] }]}>
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>
    )
  }
}

export default function App() {
  return (
    <View style={styles.container}>
      <ImagePicker />
    </View>
  );
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
});
