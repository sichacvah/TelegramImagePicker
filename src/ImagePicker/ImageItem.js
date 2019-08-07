// @ts-check
import React from 'react'
import Animated from 'react-native-reanimated'
import { ImageBackground } from 'react-native'
import * as core from './core'
import { RectButton } from 'react-native-gesture-handler'

import { View, Text } from 'react-native'

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)
const {
  cond,
  debug,
  lessThan,
  greaterThan,
  and,
  add,
  sub,
  block,
  eq,
  set,
  diffClamp
} = Animated

/**
 * @typedef {Object} RadioButtonProps
 * @property {number} index
 * @property {boolean} selected
 * @property {() => void} onSelect
 * @property {number} radius
 * @property {Animated.Node<number>} topPoint
 * @property {Animated.Node<number>} rightPoint
 */
/**
 * @extends {React.PureComponent<RadioButtonProps>}
 */
class RadioButton extends React.PureComponent {

  /** @type {any} */
  style = {
    position: 'absolute',
    top: this.props.topPoint,
    right: Animated.sub(0, this.props.rightPoint),
    width: this.props.radius * 2,
    height: this.props.radius * 2,
    borderRadius: this.props.radius,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 4,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 16.84,
    elevation: 5,
  }
  /** @type {any} */
  inner = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 2
  }
  /** @type {any} */
  text = {
    color: 'white',
    textAlign: 'center'
  }
  render() {
    const { props, style, inner, text } = this
    const { selected, index, onSelect } = props
    return (
        <Animated.View style={style}>
          <RectButton onPress={onSelect} style={{ flex: 1 }}>
            {selected ? <View style={inner}><Text style={text}>{index}</Text></View> : null}
          </RectButton>
        </Animated.View>
    )
  }
}


/**
 * @typedef {import('./core').Image} ImageType 
 * @typedef {Object} ImageItemProps
 * @property {number} index
 * @property {(index: number) => void} onSelect
 * @property {Animated.Node<number>} expansionValue
 * @property {number} margin
 * @property {number} sideSize
 * @property {number} expandedSideSize
 * @property {number} containerSize
 * @property {ImageType} image
 * @property {number} offset
 * @property {boolean} selected
 * @property {number} selectedIndex
 * @property {Animated.Node<number>} position
 * @property {number} leftOffset
 * @property {number} rightOffset 
 * @property {number} containerPadding
 */


/**
 * @extends {React.PureComponent<ImageItemProps>}
 */
export default class ImageItem extends React.PureComponent {
  radius = this.props.sideSize / 6
  radioButtonPadding = 4
  onSelect = () => this.props.onSelect(this.props.index)

  getExpandedWidth = () => {
    return core.getExpandedWidth(this.props.expandedSideSize, this.props.containerSize)(this.props.image)
  }

  // /** @type {any} */
  // imageStyle = {
  //   resizeMode: 'cover',
  //   width: Animated.interpolate(this.props.expansionValue, {
  //     inputRange: [0, 1],
  //     outputRange: [this.props.sideSize, this.getExpandedWidth()]
  //   }),
  //   height: Animated.interpolate(this.props.expansionValue, {
  //     inputRange: [0, 1],
  //     outputRange: [this.props.sideSize, this.props.expandedSideSize]
  //   })
  // }

  /**
   * @type {any}
   */
  imgWrapperStyle = {
    resizeMode: 'cover',
    width: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [this.props.sideSize, this.getExpandedWidth()]
    }),
    height: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [this.props.sideSize, this.props.expandedSideSize]
    }),
    backgroundColor: 'white',
    overflow: 'hidden',
    marginLeft: this.props.index > 0 ? this.props.margin : 0,
    borderRadius: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [
        8,
        12
      ]
    })
  }

  _defaultRightPoint = Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [-this.radioButtonPadding, -this.radioButtonPadding]
  })

  leftBoundary = 0
  rightBoundary = this.leftBoundary + this.props.containerSize + this.props.containerPadding

  positionOfRightBound = Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [
      add(this.props.position, (this.props.sideSize + this.props.margin) * (this.props.index + 1)),
      add(this.props.position, this.props.rightOffset)
    ]
  })

  positionOfLeftBound = Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [
      add(this.props.position, (this.props.sideSize + this.props.margin) * (this.props.index )),
      add(this.props.leftOffset, this.props.position)
    ]
  })

  

  width = Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [
      this.props.sideSize,
      this.getExpandedWidth()
    ]
  })
  

  tmpPoint = new Animated.Value(0)
  leftOffsetToRadioButton = this.radius * 2 + this.radioButtonPadding + this.props.margin * 2
  rightPoint = block([
    cond(
      greaterThan(this.positionOfRightBound, this.rightBoundary),
      [
        cond(
          greaterThan(this.rightBoundary - this.leftOffsetToRadioButton, this.positionOfLeftBound),
          sub(this._defaultRightPoint, sub(this.positionOfRightBound, this.rightBoundary)),
          add(this.leftOffsetToRadioButton - this.props.margin, sub(this._defaultRightPoint, this.width))
        )
      ],
      this._defaultRightPoint
    )
  ])
  getTopPoint = () => Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [this.radioButtonPadding, this.radioButtonPadding]
  })

  render() {
    const { props, imgWrapperStyle, rightPoint, getTopPoint, onSelect } = this
    const { image, selected, selectedIndex} = props
    return (
      <AnimatedImageBackground style={imgWrapperStyle} source={image}>
        <RadioButton 
          topPoint={getTopPoint()}
          rightPoint={rightPoint}
          index={selectedIndex}
          radius={this.radius}
          selected={selected}
          onSelect={onSelect} />
      </AnimatedImageBackground>
    )
  }
}