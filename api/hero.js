import { callCloudFunction } from '../utils/cloud'

/**
 * 英雄相关API
 */
export default {
  /**
   * 创建英雄
   * @param {Object} data 英雄数据
   */
  create: (data) => callCloudFunction('hero', {
    action: 'create',
    data
  }),
  
  /**
   * 获取英雄详情
   * @param {String} id 英雄ID
   */
  getById: (id) => callCloudFunction('hero', {
    action: 'get',
    data: { id }
  }),
  
  /**
   * 获取英雄列表
   * @param {Object} params 查询参数
   * @param {String} params.game 游戏类型
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params = {}) => callCloudFunction('hero', {
    action: 'get',
    data: params
  }),
  
  /**
   * 更新英雄
   * @param {String} id 英雄ID
   * @param {Object} data 要更新的字段
   */
  update: (id, data) => callCloudFunction('hero', {
    action: 'update',
    data: { id, ...data }
  }),
  
  /**
   * 删除英雄
   * @param {String} id 英雄ID
   */
  delete: (id) => callCloudFunction('hero', {
    action: 'delete',
    data: { id }
  })
}
    