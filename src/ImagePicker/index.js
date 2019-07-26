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
import { interaction, SelectionStates } from '../ReanimatedHelpers/interaction'

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
const expandingTarget = new Animated.Value(1)

/**
 * @type {Animated.Value<number>}
 */
const collapsingTarget = new Animated.Value(1)


/**
 * @extends {React.PureComponent<ImagePickerProps>}
 */
class ImagePicker extends React.PureComponent {
  getContainerWidth = () =>
    core.getContainerWidth(this.props.containerPadding)


  getPickerWidth = () => {
    return core.getPickerWidth(this.props.cellMargin, this.props.cellSideSize, this.props.images)
  }
  getPickerExpandedWidth = () => core.getPickerExpandedWidth(
    this.props.cellMargin,
    this.props.expandedCellSideSize,
    this.getContainerWidth(),
    this.props.images
  )

  constructor(props) {
    super(props)
    this.pickerWidthValue = new Animated.Value(this.getPickerWidth())
    this.expandedPickerWidthValue = new Animated.Value(this.getPickerExpandedWidth())
    this.containerWidthValue = new Animated.Value(this.getContainerWidth())
    this.progress = new Animated.Value(0)
    this.selectionState = new Animated.Value(0)
    this.selected = false
    this.positionOfSelectedImage = new Animated.Value(0)
    this.finalPickerWidth = Animated.cond(
      Animated.or(Animated.eq(this.selectionState, SelectionStates.Collapsing), Animated.eq(this.selectionState, SelectionStates.Expanded)),
      this.expandedPickerWidthValue,
      this.pickerWidthValue
    )
    this.translateX = interaction(
      { translation: translationX, state, velocityX },
      { width: this.pickerWidthValue,
        expandedWidth: this.expandedPickerWidthValue,
        containerWidth: new Animated.Value(core.getContainerWidth(this.props.containerPadding)) },
      { state: this.selectionState, expandingTarget, collapsingTarget, progress: this.progress }
    )
  }

  /**
   * 
   * @param {ImagePickerProps} prevProps 
   */
  componentDidUpdate(prevProps) {
    if (this.props.images.length !== prevProps.images.length) {
      this.pickerWidthValue.setValue(
        this.getPickerWidth()
      )
      this.expandedPickerWidthValue.setValue(
        this.getPickerExpandedWidth()
      )
    }
  }

  onEndReached = ([translateX, selectionState]) => {
    const { getPickerWidth, getContainerWidth, props, getPickerExpandedWidth } = this
    if (selectionState === SelectionStates.Collapsing || selectionState === SelectionStates.Expanding) return
    const pickerWidth = selectionState === SelectionStates.Collapsed || selectionState === SelectionStates.Collapsing ? getPickerWidth() : getPickerExpandedWidth()
    const containerWidth = getContainerWidth()
    const { onEndReaching } = props
    if (!onEndReaching || pickerWidth < containerWidth) return
    const offset = (pickerWidth + translateX)
    if (offset < 0.25 * pickerWidth) {
      onEndReaching()
    }
  }

  

  /**
   * @param {number} indx
   */
  onSelect = (indx) => {
    const { props } = this
    const { cellMargin, expandedCellSideSize, containerPadding, cellSideSize, images } = props
    const containerSize = core.getContainerWidth(containerPadding)
    const collapsingWidth = Math.min(
      -core.getPickerWidth(cellMargin, cellSideSize, images.slice(0, indx)) - cellSideSize / 2 + containerSize / 2,
      0
    )
    const expandedWidth = core.getExpandedWidth(expandedCellSideSize, containerSize)(images[indx])
    const expandingWidth = Math.min(
      -core.getPickerExpandedWidth(cellMargin, expandedCellSideSize, containerSize, images.slice(0, indx)) - expandedWidth / 2 + containerSize / 2,
      0
    )
    expandingTarget.setValue(expandingWidth)
    collapsingTarget.setValue(collapsingWidth)
    if (this.selected) {
      this.selected = false
      this.selectionState.setValue(3)
    } else {
      this.selectionState.setValue(1)
      this.selected = true
    }
  }

  

  render() {
    const { props, getContainerWidth, onEndReached, translateX, selectionState } = this
    const { images, cellMargin, expandedCellSideSize, cellSideSize } = props
    return (
      <React.Fragment>
        <PanGestureHandler
          failOffsetX={getContainerWidth()}
          {...gestureHandler}>
            <Animated.View style={[styles.picker, { width: this.finalPickerWidth, marginHorizontal: props.containerPadding }, { transform: [ { translateX: translateX } ] }]}>
              {images.map((image, idx) => (
                <ImageItem
                  key={String(idx)}
                  onSelect={this.onSelect}
                  expandedSideSize={expandedCellSideSize}
                  sideSize={cellSideSize}
                  containerSize={getContainerWidth()}
                  expansionValue={this.progress}
                  margin={cellMargin}
                  image={image}
                  index={idx} />
              ))}
            </Animated.View>
        </PanGestureHandler>
        <Animated.Code exec={Animated.call([translateX, selectionState], onEndReached)}/>
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