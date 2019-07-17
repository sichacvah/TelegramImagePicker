// @ts-check
import { CameraRoll } from 'react-native'
/**
 * @typedef {import('react-native').CameraRollAssetType} CameraRollAssetType
 * @typedef {import('./core').Image} Image 
 */

 /**
  * @typedef {Object} State
  * @property {number} pageSize
  * @property {string=} after
  * @property {CameraRollAssetType} assetType
  */

/**
 * @type {State}
 */
let state = {
  pageSize: 40,
  after: undefined,
  assetType: 'Photos'
}


/**
 * @param {CameraRollAssetType} assetType
 * @param {number} pageSize
 * @param {string} after
 * @return {Promise<Image[]>}
 */
export const fetchPhotos = (assetType=state.assetType, pageSize = 40, after) => {
  state.pageSize = pageSize
  state.after = after
  state.assetType = assetType
  return next()
}

/**
 * @return {Promise<Image[]>}
 */
export const next = () => 
  CameraRoll.getPhotos({
    first: state.pageSize,
    after: state.after,
    assetType: state.assetType
  })
  .then(({ edges, page_info }) => {
    state = {
      ...state,
      after: page_info.end_cursor
    }

    return edges.map(({ node: { image: { uri, width, height } } }) => ({
      uri,
      height,
      width
    }))
  })
