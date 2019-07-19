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
  * @property {boolean} hasNextPage
  */

/**
 * @type {State}
 */
let state = {
  pageSize: 40,
  after: undefined,
  assetType: 'Photos',
  hasNextPage: true
}


/**
 * @param {CameraRollAssetType=} assetType
 * @param {number=} pageSize
 * @param {string=} after
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
  !state.hasNextPage ? Promise.resolve([]) :
  CameraRoll.getPhotos({
    first: state.pageSize,
    after: state.after,
    assetType: state.assetType
  })
  .then(({ edges, page_info }) => {
    state = {
      ...state,
      after: page_info.end_cursor,
      hasNextPage: page_info.has_next_page
    }

    return edges.map(({ node: { image: { uri, width, height } } }) => ({
      uri,
      height,
      width
    }))
  })
