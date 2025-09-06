// 导入各模块API
import heroApi from './hero'
import mapApi from './map'
import pointApi from './point'
import userApi from './user'
import commentApi from './comment'
import collectionApi from './collection'
import submissionApi from './submission'

// 导出所有API
export default {
  hero: heroApi,
  map: mapApi,
  point: pointApi,
  user: userApi,
  comment: commentApi,
  collection: collectionApi,
  submission: submissionApi
}
    