// @ts-check
import React from 'react'
import Animated from 'react-native-reanimated'
import { TouchableWithoutFeedback } from 'react-native'
import * as core from './core'

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
 */


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
    backgroundColor: 'black',
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

  render() {
    const { props, imgWrapperStyle } = this
    const { image } = props
    return (
      <Animated.View style={imgWrapperStyle} shouldRasterizeIOS needsOffscreenAlphaCompositing>
        <TouchableWithoutFeedback onPress={this.onSelect}>
          <Animated.Image style={[this.imageStyle, { resizeMode: 'cover' }]} source={image}>
          </Animated.Image>
        </TouchableWithoutFeedback>
      </Animated.View>
    )
  }
}