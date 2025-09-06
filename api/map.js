import { callCloudFunction } from '../utils/cloud'

/**
 * 地图相关API
 */
export default {
  /**
   * 创建地图
   * @param {Object} data 地图数据
   */
  create: (data) => callCloudFunction('map', {
    action: 'create',
    data
  }),
  
  /**
   * 获取地图详情
   * @param {String} id 地图ID
   */
  getById: (id) => callCloudFunction('map', {
    action: 'get',
    data: { id }
  }),
  
  /**
   * 获取地图列表
   * @param {Object} params 查询参数
   * @param {String} params.game 游戏类型
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params = {}) => callCloudFunction('map', {
    action: 'get',
    data: params
  }),
  
  /**
   * 更新地图
   * @param {String} id 地图ID
   * @param {Object} data 要更新的字段
   */
  update: (id, data) => callCloudFunction('map', {
    action: 'update',
    data: { id, ...data }
  }),
  
  /**
   * 删除地图
   * @param {String} id 地图ID
   */
  delete: (id) => callCloudFunction('map', {
    action: 'delete',
    data: { id }
  })
}
    