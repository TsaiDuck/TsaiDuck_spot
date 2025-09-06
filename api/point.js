import { callCloudFunction } from '../utils/cloud'

/**
 * 点位相关API
 */
export default {
  /**
   * 创建点位
   * @param {Object} data 点位数据
   */
  create: (data) => callCloudFunction('point', {
    action: 'create',
    data
  }),
  
  /**
   * 获取点位详情
   * @param {String} id 点位ID
   */
  getById: (id) => callCloudFunction('point', {
    action: 'get',
    data: { id }
  }),
  
  /**
   * 获取点位列表
   * @param {Object} params 查询参数
   * @param {String} params.mapId 地图ID
   * @param {String} params.heroId 英雄ID
   * @param {String} params.userId 用户ID
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params = {}) => callCloudFunction('point', {
    action: 'get',
    data: params
  }),
  
  /**
   * 更新点位
   * @param {String} id 点位ID
   * @param {Object} data 要更新的字段
   */
  update: (id, data) => callCloudFunction('point', {
    action: 'update',
    data: { id, ...data }
  }),
  
  /**
   * 删除点位
   * @param {String} id 点位ID
   */
  delete: (id) => callCloudFunction('point', {
    action: 'delete',
    data: { id }
  }),
  
  /**
   * 点赞/取消点赞点位
   * @param {String} id 点位ID
   * @param {Boolean} like 是否点赞
   */
  like: (id, like = true) => callCloudFunction('point', {
    action: 'like',
    data: { id, like }
  })
}
    