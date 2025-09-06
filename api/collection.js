import { callCloudFunction } from '../utils/cloud'

/**
 * 收藏相关API
 */
export default {
  /**
   * 添加收藏
   * @param {String} pointId 点位ID
   */
  add: (pointId) => callCloudFunction('collection', {
    action: 'add',
    data: { pointId }
  }),
  
  /**
   * 取消收藏
   * @param {String} pointId 点位ID
   */
  remove: (pointId) => callCloudFunction('collection', {
    action: 'remove',
    data: { pointId }
  }),
  
  /**
   * 获取用户收藏列表
   * @param {Object} params 查询参数
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params = {}) => callCloudFunction('collection', {
    action: 'getList',
    data: params
  }),
  
  /**
   * 检查是否已收藏
   * @param {String} pointId 点位ID
   */
  check: (pointId) => callCloudFunction('collection', {
    action: 'check',
    data: { pointId }
  })
}
    