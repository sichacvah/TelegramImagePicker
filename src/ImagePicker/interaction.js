// @ts-check

import { State as GestureState } from 'react-native-gesture-handler'
import { Platform } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'

const {
  set,
  cond,
  eq,
  Value,
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
  min,
  neq,
  timing,
  interpolate,
  event
} = Animated

const deceleration = Platform.OS === 'ios' ? 0.998 : 0.985

/**
 * Helper for decay animation
 * @param {Animated.Clock} clock
 * @param {Animated.Value<number>} position
 * @param {Animated.Value<number>} velocity
 */
export function runDecay(clock, position, velocity) {
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time:     new Value(0)
  }
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
 * Helper for timing animation
 * @param {Animated.Clock} clock
 * @param {Animated.TimingState} state
 * @param {Animated.Value<number>} start
 * @param {Animated.Value<number>} dest
 * @param {Animated.Value<number>} toValue
 * @param {number=} [duration=300]
 */
export function runTiming(clock, state, start, dest, toValue, duration=300) {
  const config = {
    toValue,
    duration,
    easing: Easing.linear
  }

  return block([
    cond(
      clockRunning(clock),
      0,
      [
        set(state.position, start),
        set(toValue, dest),
        set(state.finished, 0),
        set(state.time, 0),
        set(state.frameTime, 0),
        startClock(clock)
      ]
    ),
    timing(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position
  ])
}

/**
 * Helper for spring animation
 * @param {Animated.Clock} clock
 * @param {Animated.Value<number>} position
 * @param {Animated.Node<number>} destination
 */
export function runSpring(clock, position, destination) {
  const config = {
    damping: 28,
    mass: 0.3,
    stiffness: 188.296,
    overshootClamping: false,
    toValue: destination,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
  }

  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time:     new Value(0)
  }

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


/** @type {0} */
const Collapsed   = 0
/** @type {1} */
const Expanding   = 1
/** @type {2} */
const Expanded    = 2
/** @type {3} */
const Collapsing  = 3
/** @type {4} */
const Snapping = 4
export const SelectionStates = {
  Collapsed,
  Expanding,
  Expanded,
  Collapsing,
  Snapping
}

/**
 * @typedef {Object} Gesture
 * @property {Animated.Value<number>} Gesture.translation
 * @property {Animated.Value<GestureState>} Gesture.state
 * @property {Animated.Value<number>} Gesture.velocityX
 * 
 * @typedef {Object} Picker
 * @property {Animated.Value<number>} Picker.width
 * @property {Animated.Value<number>} Picker.expandedWidth
 * @property {Animated.Value<number>} Picker.containerWidth
 * 
 * 
 * @typedef {0} Collapsed
 * @typedef {1} Expanding
 * @typedef {2} Expanded
 * @typedef {3} Collapsing
 * 
 * @typedef {4} Snapping
 * 
 * @typedef {Collapsed | Expanding | Expanded | Collapsing | Snapping} SelectionState
 * 
 * @typedef {Object} Selection
 * @property {Animated.Value<SelectionState>} Selection.state
 * @property {Animated.Value<number>} Selection.collapsingTarget
 * @property {Animated.Value<number>} Selection.expandingTarget
 * @property {Animated.Value<number>} Selection.progress
 * @property {Animated.Value<number>} Selection.snapTarget
 */


/**
 * 
 * @typedef {Object} Clocks
 * @property {Animated.Clock} decay
 * @property {Animated.Clock} spring
 * @property {Animated.Clock} span 
 * @property {Animated.Clock} timing
 */

/**
 * @return {Clocks}
 */
const initClocks = () => ({
  decay: new Clock(),
  span: new Clock(),
  spring: new Clock(),
  timing: new Clock()
})

/**
 * @param {Clocks} clocks
 */
const stopClocks = ({ decay, span, spring, timing }) => block([
  stopClock(decay),
  stopClock(span),
  stopClock(spring),
  stopClock(timing)
])


/**
 * 
 * @param {Picker} picker
 * @param {Selection} selection
 */
const getrightPoint = (picker, selection) => cond(
  or(eq(selection.state, Collapsed), eq(selection.state, Collapsing)),
  cond(
    lessThan(picker.containerWidth, picker.width),
    sub(picker.containerWidth, picker.width),
    0
  ),
  cond(
    lessThan(picker.containerWidth, picker.expandedWidth),
    sub(picker.containerWidth, picker.expandedWidth),
    0
  )
)

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
 * @param {Animated.Value<number>} position
 * @param {Gesture} gesture
 * @param {Picker} picker
 * @param {Animated.Node<number>} rightPoint
 * @param {Selection} selection
 */
export function drag(start, position, { translation }, { containerWidth, width: pickerWidth, expandedWidth }, rightPoint, selection) {

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
                  sub(
                    containerWidth,
                    cond(
                      or(eq(selection.state, Expanded), eq(selection.state, Expanding)),
                      expandedWidth,
                      pickerWidth
                    )
                  )
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
 * @param {Animated.Value<number>} position
 * @param {Gesture} gesture 
 * @param {Picker} picker 
 * @param {Animated.Node<number>} rightPoint
 * @param {Clocks} clocks
 * @param {Selection} selection
 */
const dragAndRelease = (position, gesture, picker, rightPoint, clocks, selection) => {
  const start = new Value(0)

  return cond(
    eq(gesture.state, GestureState.ACTIVE),
    [
      stopClocks(clocks),
      drag(start, position, gesture, picker, rightPoint, selection)
    ],
    [
      cond(lessThan(0, position), [
        stopClock(clocks.decay),
        set(position, runSpring(clocks.spring, position, new Value(0)))
      ]),
      cond(greaterThan(rightPoint, position), [
        stopClock(clocks.decay),
        set(position, runSpring(clocks.spring, position, rightPoint))
      ]),
      cond(
        and(
          greaterThan(0, position),
          lessThan(rightPoint, position),
          lessThan(5, abs(gesture.velocityX)),
          not(clockRunning(clocks.spring))
        ),
        [
          set(position, runDecay(clocks.decay, position, gesture.velocityX))
        ]
      ),
      set(start, 0)
    ]
  )
}


/**
 * @param {Animated.Clock} clock
 * @param {Picker} picker
 * @param {Selection} selection
 * @param {Animated.Value<number>} prevPosition
 * @param {Animated.Value<number>} position
 */
export const runSelection = (clock, picker, selection, prevPosition, position) => {
  const toValue = new Value(0)
  const dest = new Value(0)
  const start = new Value(0)
  const state = {
    finished: new Value(0),
    position: selection.progress,
    time: new Value(0),
    frameTime: new Value(0)
  }

  return block([
    cond(
      eq(selection.state, Expanding),
      [
        set(start, 0),
        set(dest, 1),
        cond(clockRunning(clock), 0, [
          set(prevPosition, position),
        ]),
        runTiming(clock, state, start, dest, toValue),
        cond(state.finished, [
          stopClock(clock),
          set(selection.state, Expanded),
          set(position, selection.expandingTarget),
          set(selection.collapsingTarget, 1),
        ])
      ]
    ),
    cond(
      eq(selection.state, Collapsing),
      [
        set(start, 1),
        set(dest, 0),
        cond(clockRunning(clock), 0, [
          set(prevPosition, position),
        ]),
        runTiming(clock, state, start, dest, toValue),
        cond(state.finished, [
          stopClock(clock),
          set(selection.state, Collapsed),
          set(position, selection.collapsingTarget),
          set(selection.expandingTarget, 1),
        ])
      ]
    ),
    state.position
  ])
}


/**
 * @param {Animated.Clock} clock
 * @param {Picker} picker
 * @param {Selection} selection 
 * @param {Animated.Value<number>} prevPosition
 * @param {Animated.Value<number>} position
 */
const snapTo = (clock, picker, selection, prevPosition, position) => {
  const toValue = new Value(0)
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  }
  return block([
    set(position, runTiming(clock, state, prevPosition, selection.snapTarget, toValue)),
    cond(state.finished, set(selection.state, Expanded)),
    position
  ])
}
/**
 * @param {Gesture} gesture
 * @param {Picker} picker
 * @param {Selection} selection 
 */
export const interaction = (gesture, picker, selection) => {
  const clocks = initClocks()
  const position = new Value(0)
  const prevPosition = new Value(0)


  const rightPoint = getrightPoint(picker, selection)
  const dragging = dragAndRelease(position, gesture, picker, rightPoint, clocks, selection)
  const prevState = new Value(0)
  return block([
    cond(
      eq(selection.state, Snapping),
      snapTo(clocks.timing, picker, selection, prevPosition, position)
    ),
    cond(
      or(
        eq(selection.state, Expanding),
        eq(selection.state, Collapsing)
      ),
      [
        cond(
          neq(prevState, selection.state),
          [
            stopClock(clocks.spring),
            stopClock(clocks.decay),
            set(gesture.velocityX, 0),
          ]
        ),
        runSelection(clocks.span, picker, selection, prevPosition, position),

        cond(
          or(eq(selection.state, Expanded), eq(selection.state, Expanding)),
          set(position, interpolate(selection.progress, {
            inputRange: [0, 1],
            outputRange: [prevPosition, selection.expandingTarget]
          }))
        ),
        cond(
          or(eq(selection.state, Collapsed), eq(selection.state, Collapsing)),
          set(position, interpolate(selection.progress, { 
            inputRange: [0, 1],
            outputRange: [selection.collapsingTarget, prevPosition]
           }))
        ),
      ],
      [
        dragging,
        set(prevPosition, position)
      ]
    ),
    set(prevState, selection.state),
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