// @ts-check
import React from 'react'
import {
  StyleSheet
} from 'react-native'
import * as core from './core'
import Animated from 'react-native-reanimated'
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler'
import ImageItem from './ImageItem'
import  * as helpers from './interaction'
const { SelectionStates, interaction } = helpers

/**
 * @typedef {import('./interaction').SelectionState} SelectionState
 * @typedef {import('./core').Image} Image
 * 
 * @typedef {Object} ImagePickerProps
 * @property {Image[]} images
 * @property {number} cellSideSize
 * @property {number} expandedCellSideSize
 * @property {number} cellMargin 
 * @property {number} containerPadding
 * @property {() => void=} onEndReaching
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
 * @type {Animated.Value<number>}
 */
const expandingTarget = new Animated.Value(1)

/**
 * @type {Animated.Value<number>}
 */
const collapsingTarget = new Animated.Value(1)
/**
 * @type {Animated.Value<number>}
 */
const snapTarget = new Animated.Value(0)


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

  /**
   * @param {number} index
   */
  updateSelectedState = (index) => {
    const { state, setState } = this
    const { selectedOrder, selected } = state
    if (selected[index]) {
      this.setState({
        selected: {
          ...selected,
          [index]: false
        },
        selectedOrder: selectedOrder.filter(i => i !== index)
      })
    } else {
      this.setState({
        selected: {
          ...selected,
          [index]: true
        },
        selectedOrder: selectedOrder.concat([index])
      })
    }
  }

  constructor(props) {
    super(props)
    this.pickerWidthValue = new Animated.Value(this.getPickerWidth())
    this.expandedPickerWidthValue = new Animated.Value(this.getPickerExpandedWidth())
    this.containerWidthValue = new Animated.Value(this.getContainerWidth())
    this.progress = new Animated.Value(0)
    /** @type {Animated.Value<SelectionState>} */
    this.selectionState = new Animated.Value(0)
    this.state = {
      selectedOrder: [],
      selected: {}
    }
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
      { state: this.selectionState, expandingTarget, collapsingTarget, progress: this.progress, snapTarget }
    )
    this.translateY = Animated.interpolate(this.progress, {
      inputRange: [0, 1],
      outputRange: [0, this.props.expandedCellSideSize / 2 - this.props.cellSideSize / 2]
    })
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

  

  needToAnimate = false
  /**
   * @param {number} indx
   */
  onSelect = (indx) => {
    const { props } = this
    const { cellMargin, expandedCellSideSize, containerPadding, cellSideSize, images } = props
    const containerSize = core.getContainerWidth(containerPadding)
    this.needToAnimate = true
    
    if (this.state.selectedOrder.length === 0) {
      expandingTarget.setValue(
        core.getExpandingTarget(cellMargin, expandedCellSideSize, images, indx, containerSize)
      )
      this.updateSelectedState(indx)
      return
    }
    if (this.state.selectedOrder.length === 1 && this.state.selected[indx]) {
      collapsingTarget.setValue(
        core.getCollapsingTarget(cellMargin, cellSideSize, images, indx, containerSize)
      )
      this.updateSelectedState(indx)
      return
    }
    snapTarget.setValue(
      core.getExpandingTarget(cellMargin, expandedCellSideSize, images, indx, containerSize)
    )
    this.updateSelectedState(indx)
  }

  expand = () => {
    if (!this.needToAnimate) return
    this.selectionState.setValue(SelectionStates.Expanding)
    this.needToAnimate = false
  }

  snapTo = () => {
    if (!this.needToAnimate) return
    this.selectionState.setValue(SelectionStates.Snapping)
    this.needToAnimate = false
  }

  collapse = () => {
    if (!this.needToAnimate) return
    this.selectionState.setValue(SelectionStates.Collapsing)
    this.needToAnimate = false
  }

  render() {
    const { props, getContainerWidth, onEndReached, translateX, selectionState, finalPickerWidth, expand, collapse, translateY, state, snapTo } = this
    const { images, cellMargin, expandedCellSideSize, cellSideSize, containerPadding } = props
    const { selected, selectedOrder } = state
    const preparedImages = core.prepareImages(cellSideSize, expandedCellSideSize, containerPadding, images)

    return (
      <Animated.View>
        <PanGestureHandler
          failOffsetX={getContainerWidth()}
          {...gestureHandler}>
            <Animated.View shouldRasterizeIOS style={[styles.picker, { width: finalPickerWidth, marginHorizontal: props.containerPadding }, { transform: [ { translateX, translateY } ] }]}>
              {preparedImages.map((image, idx) => {
                return (
                  <ImageItem
                    selected={selected[idx]}
                    selectedIndex={selected[idx] ? selectedOrder.findIndex(i => i === idx) + 1 : 0}
                    key={String(idx)}
                    onSelect={this.onSelect}
                    offset={image.offset}
                    expandedSideSize={expandedCellSideSize}
                    sideSize={cellSideSize}
                    containerSize={getContainerWidth()}
                    expansionValue={this.progress}
                    margin={cellMargin}
                    image={image}
                    index={idx} />
                )
              })}
            </Animated.View>
        </PanGestureHandler>
        <Animated.Code exec={Animated.onChange(translateX, Animated.call([translateX, selectionState], onEndReached))}/>
        <Animated.Code exec={Animated.onChange(expandingTarget, Animated.call([expandingTarget, selectionState], expand))} />
        <Animated.Code exec={Animated.onChange(collapsingTarget, Animated.call([collapsingTarget, selectionState], collapse))} />
        <Animated.Code exec={Animated.onChange(snapTarget, Animated.call([snapTarget, selectionState], snapTo))} />
      </Animated.View>
    )
  }
}


const styles = StyleSheet.create({  
  picker: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})

export default ImagePicker