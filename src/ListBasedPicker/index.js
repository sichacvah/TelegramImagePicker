// @ts-check
import React from 'react'
import { FlatList, Dimensions, StyleSheet, View } from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import * as core from '../ImagePicker/core'
import ImageItem from '../ImagePicker/ImageItem'
import ImagePicker from '../ImagePicker'

const {
  event
} = Animated

/**
 * @typedef {import('../ImagePicker/core').Image} Image
 * 
 * @typedef {Object} ImagePickerProps
 * @property {Image[]} images
 * @property {number} cellSideSize
 * @property {number} expandedCellSideSize
 * @property {number} cellMargin 
 * @property {number} containerPadding
 * @property {() => {}=} onEndReaching
 */

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

/**
 * @extends {React.PureComponent<ImagePickerProps>}
 */
class ListBasedPicker extends React.PureComponent {
  position = new Animated.Value(0)

  listRef = React.createRef()

  scrollEventHandler = event([{
    nativeEvent: {
      contentOffset: {
        x: this.position
      }
    }
  }])
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
   * @param {number} cellMargin
   * @param {number} cellSideSize
   * @return {number}
   */
  getOverallCount = (cellMargin, cellSideSize) => {
    const { width } = Dimensions.get('window')
    return Math.floor(width / (cellMargin + cellSideSize))
  }

  /**
   * @param {number} indx
   */
  getCountOfLeftCells = (indx) => {
    const { props } = this
    const { cellMargin, cellSideSize } = props
    const overallCount = this.getOverallCount(cellMargin, cellSideSize)

    const centerIndx = Math.floor(overallCount / 2)
    if (indx < centerIndx) {
      return indx + 1
    }
    return centerIndx
  }

  getIndexes = (images, leftBound, rightBound, centerIndx) => {
    const { props } = this
    const { cellMargin, expandedCellSideSize, containerPadding, cellSideSize } = props
    const containerSize = core.getContainerWidth(containerPadding)
    const centerExpWidth = core.getExpandedWidth(expandedCellSideSize, containerSize)(images[centerIndx])
    const centerTarget = Math.max(0 + containerPadding,  containerSize / 2 - centerExpWidth / 2 + containerPadding)
    let i = centerIndx
    let finalIndex = {}
    const maxIndexes = rightBound < images.length ? rightBound : images.length - 1
    let prevTarget
    let imagesWithIndexes = []
    while (i >= leftBound) {
      if (i === centerIndx) {
        finalIndex[i] = centerTarget
        imagesWithIndexes = [{ indx: i, target: centerTarget }]
      } else {
        prevTarget = finalIndex[i + 1]
        finalIndex[i] = prevTarget - core.getExpandedWidth(expandedCellSideSize, containerSize)(images[i]) - cellMargin
        imagesWithIndexes = [{ indx: i, target: finalIndex[i] }].concat(imagesWithIndexes)
      }
      i--
    }
    i = centerIndx + 1
    while (i <= maxIndexes) {
      prevTarget = finalIndex[i - 1]
      finalIndex[i] =  prevTarget + core.getExpandedWidth(expandedCellSideSize, containerSize)(images[i - 1]) + cellMargin
      imagesWithIndexes.push({ indx: i, target: finalIndex[i] })
      i++
    }
    return imagesWithIndexes
  }

  progress = new Animated.Value(0)

  onSelect = (indx) => {
    const { props, imageRefs } = this
    const { cellMargin, expandedCellSideSize, containerPadding, cellSideSize, images } = props
    const leftCount = this.getCountOfLeftCells(indx)
    const overallCount = this.getOverallCount(cellMargin, cellSideSize)
    const containerSize = core.getContainerWidth(containerPadding)
    // const indexes = this.getIndexes(images, 0, images.length - 1, indx)
    const indexes = this.getIndexes(images, 0, images.length - 1, indx)
    requestAnimationFrame(() => {
      indexes.forEach(({ indx, target }) => {
        if (!this.imageRefs[indx]) return
        this.imageRefs[indx].expandTo(target)
      })
      Animated.timing(this.progress, {
        duration: 200,
        toValue: 1,
        easing: Easing.inOut(Easing.ease)
      }).start()
    })
  }

  imageRefs = {}

  keyExtractor = (item, index) => String(index)

  renderItem = ({item, index}) => (
    <Animated.View style={{ width: this.props.cellSideSize, height: this.props.cellSideSize, borderRadius: 4, overflow: 'hidden' }}>
      <Animated.Image source={item} style={{ width: this.props.cellSideSize, height: this.props.cellSideSize }} />
    </Animated.View>
      // <ImageItem
      //   ref={(node) => {this.imageRefs[index] = node;}}
      //   onSelect={this.onSelect}
      //   expandedSideSize={this.props.expandedCellSideSize}
      //   left={index * (this.props.cellMargin + this.props.cellSideSize)}
      //   sideSize={this.props.cellSideSize}
      //   translate={new Animated.Value(0)}
      //   containerSize={this.getContainerWidth()}
      //   expansionValue={this.progress}
      //   margin={this.props.cellMargin}
      //   position={this.position}
      //   image={item}
      //   index={index}
      // />
    
  )

  translateX = Animated.sub(0, this.position)

  separator = () => (
    <View style={{width: this.props.cellMargin, height: '100%'}} />
  )
  // finalPickerWidth = Animated.cond(
  //   Animated.or(Animated.eq(this.selectionState, SelectionStates.Expanding), Animated.eq(this.selectionState, SelectionStates.Expanded)),
  //   this.expandedPickerWidthValue,
  //   this.pickerWidthValue
  // )

  componentDidMount() {
    this.listRef.current.getNode().getScrollResponder().scrollResponderZoomTo({
      x: 100, y: 100, width: 300, height: 100, animated: true
    }, true)
  
  }

  _position = 0
  render() {
    const { props } = this
    const { images } = props
    return (
      <Animated.View style={StyleSheet.absoluteFill}>
        <AnimatedFlatList
          ref={this.listRef}
          horizontal
          ItemSeparatorComponent={this.separator}
          onScroll={this.scrollEventHandler}
          style={styles.container}
          contentContainerStyle={[styles.picker, { marginHorizontal: props.containerPadding}]}
          keyExtractor={this.keyExtractor}
          data={images}
          renderItem={this.renderItem}
        />
        <Animated.Code exec={
          Animated.onChange(this.position, Animated.call([this.position], ([pos]) => console.log('pos', pos)))
        }/>

        <Animated.View style={[
          styles.picker,
          { transform: [ { translateX: this.translateX } ], position: 'absolute', width: this.getPickerWidth(), height: 100, flex: 1, flexDirection: 'row', marginHorizontal: props.containerPadding, backgroundColor: 'blue' }]}>
            {images.map((image, idx) => (
              <ImageItem
                key={String(idx)}
                selectionState={new Animated.Value(0)}
                expandedSideSize={this.props.expandedCellSideSize}
                position={this.position}
                sideSize={this.props.cellSideSize}
                translate={new Animated.Value(0)}
                containerSize={this.getContainerWidth()}
                expansionValue={this.progress}
                margin={idx === 0 ? 0 : this.props.cellMargin}
                image={image}
                index={idx} />
            ))}
          </Animated.View>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({  
  picker: {
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    
  },
})

export default ListBasedPicker