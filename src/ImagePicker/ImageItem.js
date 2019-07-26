// @ts-check
import React from 'react'
import Animated from 'react-native-reanimated'
import { StyleSheet, TouchableWithoutFeedback, Image } from 'react-native'
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
 */


/**
 * @extends {React.PureComponent<ImageItemProps>}
 */
export default class ImageItem extends React.PureComponent {
  onSelect = () => this.props.onSelect(this.props.index)

  imageStyle = {
    width: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [this.props.sideSize, core.getExpandedWidth(this.props.expandedSideSize, this.props.containerSize)(this.props.image)],
      extrapolate: Animated.Extrapolate.CLAMP
    }),
    height: Animated.interpolate(this.props.expansionValue, {
      inputRange: [0, 1],
      outputRange: [
        this.props.sideSize,
        this.props.expandedSideSize
      ],
      extrapolate: Animated.Extrapolate.CLAMP

    })
  }

  imgWrapperStyles = StyleSheet.create({
    firstImgWrapper: {
      borderRadius: 4,
      overflow: 'hidden',
      marginLeft: 0
    },
    imgWrapper: {
      borderRadius: 4,
      overflow: 'hidden',
      marginLeft: this.props.margin
    }
  })

  render() {
    const { props, imgWrapperStyles } = this
    const { index, image } = props
    return (
      <Animated.View style={index === 0 ? imgWrapperStyles.firstImgWrapper : imgWrapperStyles.imgWrapper}>
        <TouchableWithoutFeedback onPress={this.onSelect}>
          <Animated.Image  source={{ uri: image.uri }} style={this.imageStyle} />
        </TouchableWithoutFeedback>
      </Animated.View>
    )
  }
}