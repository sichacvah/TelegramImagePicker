// @ts-check
import React from 'react'
import {
  StyleSheet,
  View,
  Dimensions,
  Platform
} from 'react-native'
import Animated from 'react-native-reanimated'
import { State as GestureState } from 'react-native-gesture-handler'

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
  multiply,
  greaterThan,
  spring,
  lessThan,
  and,
  abs,
  max,
  min
} = Animated


const initEmptyState = () => ({
  finished: new Value(0),
  velocity: new Value(0),
  position: new Value(0),
  time:     new Value(0)
})

const deceleration = Platform.OS === 'ios' ? 0.998 : 0.985

/**
 * 
 * @param {Animated.Clock} clock 
 * @param {Animated.Value} position 
 * @param {Animated.Value} velocity 
 */
export function runDecay(clock, position, velocity) {
  const state = initEmptyState()
  const config = { deceleration }

  return block([
    cond(
      clockRunning(clock),
      0,
      [
        set(state.finished, 0),
        set(state.velocity, velocity),
        set(state.position, position),
        set(state.time, 0),
        startClock(clock)
      ]
    ),
    set(state.position, position),
    decay(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position
  ])
}

/**
 * 
 * @param {Animated.Clock} clock 
 * @param {Animated.Value} position 
 * @param {Animated.Value} value 
 */
export function runSpring(clock, position, value) {
  const config = {
    damping: 28,
    mass: 0.3,
    stiffness: 188.296,
    overshootClamping: false,
    toValue: value,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  }

  const state = initEmptyState()

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.position, position),
      startClock(clock)
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position
  ])
}

/**
 * @param {Animated.Node<number>} value
 * @param {number} [maxFriction=5]
 * @param {number} [maxValue=100]
 */
export function friction(value, maxFriction = 5, maxValue = 100) {
  return max(
    1,
    min(
      maxFriction,
      add(
        1,
        multiply(
          value,
          (maxFriction - 1) / maxValue
        )
      )
    )
  )
}
/**
 * @param {Animated.Value<number>} start
 * @param {Animated.Value<number>} translation
 * @param {Animated.Value<number>} position
 * @param {number} pickerWidth
 * @param {number} containerWidth
 */
export function drag(start, translation, position, pickerWidth, containerWidth) {

  const rightPoint = containerWidth < pickerWidth ? containerWidth - pickerWidth : 0
  const outOfBounds = or(
    lessThan(0, position),
    greaterThan(rightPoint, position)
  )

  return block([
    set(
      position,
      add(
        position,
        cond(
          outOfBounds,
          cond(
            lessThan(0, position),
            divide(
              sub(translation, start),
              friction(abs(position))
            ),
            divide(
              sub(translation, start),
              friction(
                abs(
                  sub(containerWidth, pickerWidth)
                )
              )
            )
          ),
          sub(translation, start)
        )
      )
    ),
    set(start, translation)
  ])
}


/**
 * 
 * @param {Animated.Value<number>} translation 
 * @param {Animated.Value<number>} state 
 * @param {Animated.Value<number>} velocityX
 * @param {number} pickerWidth
 * @param {number} containerWidth
 */
export function interaction(translation, state, velocityX, pickerWidth, containerWidth) {
  const rightPoint = containerWidth < pickerWidth ? containerWidth - pickerWidth : 0
  const decayClock = new Clock()
  const springClock = new Clock()
  const start = new Value(0)
  const position = new Value(0)
  return block([
    cond(
      eq(state, GestureState.ACTIVE),
      [
        stopClock(decayClock),
        stopClock(springClock),
        drag(start, translation, position, pickerWidth, containerWidth)
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
          ),
          [
            set(position, runDecay(decayClock, position, velocityX))
          ]
        ),
        set(start, 0)
      ]
    ),
    position
  ])
}

/**
 * @param {Object} nativeEvent
 */
export function eventHandler(nativeEvent) {
  const handler = event([{
    nativeEvent
  }])

  return {
    onHandlerStateChange: handler,
    onGestureEvent: handler
  }
}