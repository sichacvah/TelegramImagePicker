import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated'
import SpringConfig from 'react-native-reanimated/src/SpringConfig'
import { PanGestureHandler, State as GestureState, ScrollView } from 'react-native-gesture-handler'

const {
  set,
  cond,
  eq,
  Value,
  event,
  Clock,
  stopClock,
  not,
  or,
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
  and,
  abs,
  max,
  min
} = Animated
const translationX = new Value(0)
const velocityX = new Value(0)
const state = new Value(GestureState.UNDETERMINED)
const position = new Value(0)

const {width} = Dimensions.get('window')
const pickerWidth = width * 4

function runDecay(clock, position, velocity) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  }
  const config = {
    deceleration: 0.998
  }
  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, position),
      set(state.time, 0),
      startClock(clock)
    ]),
    set(state.position, position),
    decay(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ])
}

function runSpring(clock, position, value) {
  const config = {
    damping: 28,
    mass: 0.3,
    stiffness: 188.296,
    overshootClamping: false,
    toValue: value,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  };


  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  }
  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.position, position),
      startClock(clock),
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position,
  ])
}

function friction(value) {
  const MAX_FRICTION = 5;
  const MAX_VALUE = 100;
  return max(
    1,
    min(MAX_FRICTION, add(1, multiply(value, (MAX_FRICTION - 1) / MAX_VALUE)))
  );
}

const start = new Value(0)
const drag = (translation) => {
  const rightPoint = width < pickerWidth ? width - pickerWidth : 0
  const decayClock = new Clock()
  const springClock = new Clock()
  const outOfBounds = or(lessThan(0, position), greaterThan(rightPoint, position))
  return block([
    cond(
      eq(state, GestureState.ACTIVE),
      [
        debug('outOfBounds', outOfBounds),
        debug('friction', friction(outOfBounds)),
        stopClock(decayClock),
        stopClock(springClock),
        set(
          position,
          cond(
            outOfBounds,
            [
              cond(
                lessThan(0, position),
                add(position, divide(sub(translation, start), friction(abs(position)))),
                add(position, divide(sub(translation, start), friction(abs(sub(width, pickerWidth)))))
              )
            ],
            add(position, sub(translation, start))
          )
        ),
        set(start, translation),
      ],
      [
        cond(lessThan(0, position), [
          stopClock(decayClock),
          set(position, runSpring(springClock, position, new Value(0)))
        ]),
        cond(greaterThan(rightPoint, position), [
          stopClock(decayClock),
          set(position, runSpring(springClock, position, new Value(rightPoint)))
        ]),
        cond(
          and(
            greaterThan(0, position),
            lessThan(rightPoint, position),
            lessThan(5, abs(velocityX)),
            not(clockRunning(springClock))
          ), [
            set(position, runDecay(decayClock, position, velocityX))
          ]
        ),
        set(start, 0)
      ]
    ),
    debug('pos', position)
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
      <PanGestureHandler failOffsetX={width}  onHandlerStateChange={this.eventHandler} onGestureEvent={this.eventHandler}>
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
      <ScrollView horizontal contentContainerStyle={{ height: 80, width: pickerWidth, justifyContent: 'space-between' }}>
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
            <Animated.View style={{width: 80, height: 80, backgroundColor: 'blue'}} />
      </ScrollView>
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
