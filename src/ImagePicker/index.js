// @ts-check
import React from 'react'
import {
  StyleSheet,
  View,
  CameraRoll,
  Image as ImageCmp,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import * as helpers from '../ReanimatedHelpers'
import * as core from './core'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler'
import ImageItem from './ImageItem'

/**
 * @typedef {import('./core').Image} Image
 * 
 * @typedef {Object} ImagePickerProps
 * @property {Image[]} images
 * @property {number} cellSideSize
 * @property {number} expandedCellSideSize
 * @property {number} cellMargin 
 * @property {number} containerPadding
 * @property {() => {}=} onEndReaching
 */



const translationX = new Animated.Value(0)
const velocityX = new Animated.Value(0)
const state = new Animated.Value(GestureState.UNDETERMINED)
const gestureHandler = helpers.eventHandler({
  translationX,
  velocityX,
  state
})



/**
 * @type {Animated.Value<helpers.ExpandedState>}
 */
const expanded = new Animated.Value(helpers.EXPANDED_STATES.IDLE)

/**
 * @type {Animated.Value<number>}
 */
const target = new Animated.Value(-1)


/**
 * @extends {React.PureComponent<ImagePickerProps>}
 */
class ImagePicker extends React.PureComponent {
  get containerWidth() {
    return core.getContainerWidth(this.props.containerPadding)
  }
  containerWidthValue = new Animated.Value(this.containerWidth)

  get pickerWidth() {
    return core.getPickerWidth(this.props.cellMargin, this.props.cellSideSize, this.props.images)
  }
  pickerWidthValue = new Animated.Value(this.pickerWidth)

  /**
   * 
   * @param {ImagePickerProps} prevProps 
   */
  componentDidUpdate(prevProps) {
    if (this.props.images.length !== prevProps.images.length) {
      this.pickerWidthValue.setValue(
        core.getPickerWidth(this.props.cellMargin, this.props.cellSideSize, this.props.images)
      )
    }
  }

  onEndReached = ([translateX]) => {
    const { pickerWidth, containerWidth, props } = this
    const { onEndReaching } = props
    if (!onEndReaching || pickerWidth < containerWidth) return
    const offset = (pickerWidth + translateX)
    if (offset < 0.25 * pickerWidth) {
      onEndReaching()
    }
  }

  expansion = new Animated.Value(0)
  expansionClock = new Animated.Clock()

  expansionValue = Animated.block([
    Animated.cond(
      Animated.eq(expanded, helpers.EXPANDED_STATES.EXPANDING),
      [
        Animated.set(this.expansion, helpers.runSpring(this.expansionClock, this.expansion, new Animated.Value(1)))
      ],
      Animated.cond(Animated.eq(expanded, helpers.EXPANDED_STATES.COLLAPSING),[
        Animated.set(this.expansion, helpers.runSpring(this.expansionClock, this.expansion, new Animated.Value(0)))
      ])
    ),
    this.expansion
  ])

  translateX = helpers.interaction(
    translationX,
    state,
    velocityX,
    this.pickerWidthValue,
    this.containerWidthValue,
    expanded,
    target
  )

  selected = false

  /**
   * @param {number} indx
   */
  onSelect = (indx) => {
    const { props } = this
    const { cellMargin, expandedCellSideSize, containerPadding, cellSideSize, images } = props
    const containerSize = core.getContainerWidth(containerPadding)
    if (this.selected) {
      this.selected = false
      this.pickerWidthValue.setValue(core.getPickerWidth(cellMargin, cellSideSize, images))
      target.setValue(-core.getPickerWidth(cellMargin, cellSideSize, images.slice(0, indx)))

      expanded.setValue(helpers.EXPANDED_STATES.COLLAPSING)
    } else {
      this.pickerWidthValue.setValue(core.getPickerExpandedWidth(cellMargin, expandedCellSideSize, containerSize, images))
      target.setValue(-core.getPickerExpandedWidth(cellMargin, expandedCellSideSize, containerSize, images.slice(0, indx)))
      expanded.setValue(helpers.EXPANDED_STATES.EXPANDING)
      this.selected = true
    }
  }


  render() {
    const { props, containerWidth, pickerWidth, onEndReached, translateX } = this
    const { images, cellMargin, expandedCellSideSize, cellSideSize } = props
    return (
      <React.Fragment>
        <PanGestureHandler
          failOffsetX={containerWidth}
          {...gestureHandler}>
            <Animated.View style={[styles.picker, { width: pickerWidth, marginHorizontal: props.containerPadding }, { transform: [ { translateX: translateX } ] }]}>
              {images.map((image, idx) => (
                <ImageItem
                  key={String(idx)}
                  onSelect={this.onSelect}
                  expandedSideSize={expandedCellSideSize}
                  sideSize={cellSideSize}
                  containerSize={this.containerWidth}
                  expansionValue={this.expansionValue}
                  margin={cellMargin}
                  image={image}
                  index={idx} />
              ))}
            </Animated.View>
        </PanGestureHandler>
        <Animated.Code exec={Animated.call([translateX], onEndReached)}/>
      </React.Fragment>
    )
  }
}


const styles = StyleSheet.create({  
  picker: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

export default ImagePicker