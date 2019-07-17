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
const getAspectRatio = ({ width, height }) => width / height

/**
 * @param {number} expandedHeight
 * @return {(image: Image) => number}
 */
const getExpandedWidth = (expandedHeight) => (image) =>
  getAspectRatio(image) * expandedHeight

/**
 * @param {number} padding
 * @return {number}
 */
const getContainerWidth = (padding) =>  {
  const {width} = Dimensions.get('window')

  return width - padding * 2
}

/**
 * @param {number} margin
 * @param {number} expandedHeight
 * @param {Image[]} images
 * @return {number}
 */
const getPickerWidth = (margin, expandedHeight, images) => {
  return images.reduce((overalwidth, image, indx) => {
    const width = getExpandedWidth(expandedHeight)(image)
    return overalwidth + width + (indx > 0 ? margin : 0)
  }, 0)
}