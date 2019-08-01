// @ts-check
import { Dimensions } from 'react-native'

/**
 * @typedef {Object} Image
 * @property {number} width
 * @property {number} height
 * @property {string} uri
 * 
 */

/**
 * @param {Image} image
 * @return {number} aspectRatio
 */
export const getAspectRatio = ({ width, height }) => width / height

/**
 * @param {number} expandedHeight
 * @param {number} containerWidth
 * @return {(image: Image) => number}
 */
export const getExpandedWidth = (expandedHeight, containerWidth) => (image) =>
  Math.min(containerWidth * .7, getAspectRatio(image) * expandedHeight)

/**
 * @param {number} padding
 * @return {number}
 */
export const getContainerWidth = (padding) =>  {
  const {width} = Dimensions.get('window')

  return width - padding * 2
}
/**
 * @param {number} margin
 * @param {number} imageWidth
 * @param {Image[]} images
 * @return {number}
 */
export const getPickerWidth = (margin, imageWidth, images) => {
  return images.reduce((overalwidth, image, indx) => {
    return overalwidth + imageWidth + (indx > 0 ? margin : 0)
  }, 0)
}

/**
 * @param {number} margin
 * @param {number} expandedHeight
 * @param {number} containerWidth
 * @param {Image[]} images
 * @return {number}
 */
export const getPickerExpandedWidth = (margin, expandedHeight, containerWidth, images) => {
  return images.reduce((overalwidth, image, indx) => {
    const width = getExpandedWidth(expandedHeight, containerWidth)(image)
    return overalwidth + width + (indx > 0 ? margin : 0)
  }, 0)
}


/**
 * @param {number} cellSideSize
 * @param {number} expandedCellSideSize
 * @param {number} containerPadding
 * @param {Image[]} images
 */
export const prepareImages = (cellSideSize, expandedCellSideSize, containerPadding, images) => {
  const { images: preparedImages } = images.reduce((acc, image) => {
    const prevOffset = acc.offset
    const offset = prevOffset + cellSideSize - getExpandedWidth(expandedCellSideSize, getContainerWidth(containerPadding))(image)
    return {
      images: acc.images.concat([{...image, offset: prevOffset }]),
      offset
    }
  }, { images: [], offset: 0 })
  return preparedImages
}

/**
 * 
 * @param {number} cellMargin 
 * @param {number} cellSideSize 
 * @param {Image[]} images 
 * @param {number} index 
 * @param {number} containerSize 
 */
export const getCollapsingTarget = (cellMargin, cellSideSize, images, index, containerSize) => {
  return Math.min(
    -getPickerWidth(cellMargin, cellSideSize, images.slice(0, index)) - cellSideSize / 2 + containerSize / 2 - cellMargin,
    0
  )
}


/**
 * 
 * @param {number} cellMargin 
 * @param {number} expandedCellSideSize 
 * @param {Image[]} images 
 * @param {number} index 
 * @param {number} containerSize 
 */
export const getExpandingTarget = (cellMargin, expandedCellSideSize, images, index, containerSize) => {
  const expandedWidth = getExpandedWidth(expandedCellSideSize, containerSize)(images[index])
  return Math.min(
    -getPickerExpandedWidth(cellMargin, expandedCellSideSize, containerSize, images.slice(0, index)) - expandedWidth / 2 + containerSize / 2 - cellMargin,
    0
  )
}