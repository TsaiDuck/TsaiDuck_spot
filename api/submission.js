import { callCloudFunction } from '../utils/cloud'

/**
 * 投稿相关API
 */
export default {
  /**
   * 创建投稿
   * @param {Object} data 投稿数据
   */
  create: (data) => callCloudFunction('submission', {
    action: 'create',
    data
  }),
  
  /**
   * 获取投稿列表
   * @param {Object} params 查询参数
   * @param {String} params.status 投稿状态
   * @param {Boolean} params.isAdmin 是否管理员视角
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params = {}) => callCloudFunction('submission', {
    action: 'getList',
    data: params
  }),
  
  /**
   * 更新投稿
   * @param {String} id 投稿ID
   * @param {Object} data 要更新的字段
   */
  update: (id, data) => callCloudFunction('submission', {
    action: 'update',
    data: { id, ...data }
  }),
  
  /**
   * 删除投稿
   * @param {String} id 投稿ID
   */
  delete: (id) => callCloudFunction('submission', {
    action: 'delete',
    data: { id }
  }),
  
  /**
   * 审核投稿（管理员）
   * @param {String} id 投稿ID
   * @param {String} status 审核结果（approved/rejected）
   * @param {String} reason 拒绝原因（仅拒绝时需要）
   */
  review: (id, status, reason = '') => callCloudFunction('submission', {
    action: 'review',
    data: { id, status, reason }
  })
}
    