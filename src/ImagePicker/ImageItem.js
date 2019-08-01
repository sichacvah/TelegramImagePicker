// @ts-check
import React from 'react'
import Animated from 'react-native-reanimated'
import { TouchableWithoutFeedback, ImageBackground } from 'react-native'
import * as core from './core'

import { View, Text } from 'react-native'

/**
 * @typedef {Object} RadioButtonProps
 * @property {number} index
 * @property {boolean} selected
 * @property {() => void} onSelect
 * @property {number} sideSize
 * @property {Animated.Node<number>} topPoint
 * @property {Animated.Node<number>} rightPoint
 */
/**
 * @extends {React.PureComponent<RadioButtonProps>}
 */
class RadioButton extends React.PureComponent {

  radius = this.props.sideSize / 8
  /** @type {any} */
  style = {
    position: 'absolute',
    top: 0,
    right: 0,
    // top: Animated.add(this.props.topPoint, 4),
    // right: Animated.add(this.props.rightPoint, 4),
    width: this.radius * 2,
    height: this.radius * 2,
    borderRadius: this.radius,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    transform: [
      {

        translateY: this.props.topPoint,
        translateX: this.props.rightPoint
      }
    ],
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
    backgroundColor: 'red'
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
      <TouchableWithoutFeedback onPress={onSelect}>
        <Animated.View style={style}>
          {selected ? <View style={inner}><Text style={text}>{index}</Text></View> : null}
        </Animated.View>
      </TouchableWithoutFeedback>
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
 */

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

/**
 * @extends {React.PureComponent<ImageItemProps>}
 */
export default class ImageItem extends React.PureComponent {
  onSelect = () => this.props.onSelect(this.props.index)

  getExpandedWidth = () => {
    return core.getExpandedWidth(this.props.expandedSideSize, this.props.containerSize)(this.props.image)
  }

  /** @type {any} */
  imageStyle = {
    width:  this.getExpandedWidth(),
    height: this.props.expandedSideSize,
    resizeMode: 'cover',

    transform: [
      {
        scaleY: Animated.interpolate(this.props.expansionValue, {
          inputRange: [0, 1],
          outputRange: [this.props.expandedSideSize / this.props.sideSize, 1],
          extrapolate: Animated.Extrapolate.CLAMP
        }),
        scaleX: Animated.interpolate(this.props.expansionValue, {
          inputRange: [0, 1],
          outputRange: [this.getExpandedWidth() / this.props.sideSize, 1],
          extrapolate: Animated.Extrapolate.CLAMP
        })
      }
    ]
  }

  /**
   * @type {any}
   */
  imgWrapperStyle = {
    transform: [
      {
        translateX: Animated.interpolate(this.props.expansionValue, {
          inputRange: [0, 1],
          outputRange: [this.props.offset + this.props.sideSize / 2 - this.getExpandedWidth() / 2, 0]
        }),
        scaleX: Animated.interpolate(this.props.expansionValue, {
          inputRange: [0, 1],
          outputRange: [this.props.sideSize / this.getExpandedWidth(), 1],
          extrapolate: Animated.Extrapolate.CLAMP
        }),
        scaleY: Animated.interpolate(this.props.expansionValue, {
          inputRange: [0, 1],
          outputRange: [this.props.sideSize / this.props.expandedSideSize, 1],
          extrapolate: Animated.Extrapolate.CLAMP
        })        
      }
    ],
    backgroundColor: 'white',
    overflow: 'hidden',
    marginLeft: this.props.index > 0 ? this.props.margin : 0,
    borderRadius: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [
        8,
        16
      ]
    })
  }
  getRightPoint = () =>  Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [this.props.offset + this.props.sideSize - this.getExpandedWidth() - 4, -4]
  })
  getTopPoint = () => Animated.interpolate(this.props.expansionValue, {
    inputRange: [0, 1],
    outputRange: [(this.props.expandedSideSize - this.props.sideSize) / 2 + 4, 4]
  })

  render() {
    const { props, imgWrapperStyle, getRightPoint, getTopPoint, onSelect } = this
    const { image, index, selected, selectedIndex} = props
    return (
      <Animated.View>
        <Animated.View style={imgWrapperStyle} shouldRasterizeIOS needsOffscreenAlphaCompositing>
          <AnimatedImageBackground style={this.imageStyle} source={image} >
          </AnimatedImageBackground>
        </Animated.View>
        <RadioButton 
          topPoint={getTopPoint()}
          rightPoint={getRightPoint()}
          index={selectedIndex}
          sideSize={props.sideSize}
          selected={selected}
          onSelect={onSelect} />
      </Animated.View>
    )
  }
}