import { callCloudFunction } from '../utils/cloud'

/**
 * 评论相关API
 */
export default {
  /**
   * 创建评论
   * @param {Object} data 评论数据
   * @param {String} data.pointId 点位ID
   * @param {String} data.content 评论内容
   * @param {String} [data.parentId] 父评论ID（回复时需要）
   * @param {String} [data.replyToUserId] 被回复用户ID
   */
  create: (data) => callCloudFunction('comment', {
    action: 'create',
    data
  }),
  
  /**
   * 获取点位的评论列表
   * @param {Object} params 查询参数
   * @param {String} params.pointId 点位ID
   * @param {Number} params.page 页码
   * @param {Number} params.pageSize 每页条数
   */
  getList: (params) => callCloudFunction('comment', {
    action: 'get',
    data: params
  }),
  
  /**
   * 更新评论
   * @param {String} id 评论ID
   * @param {String} content 新的评论内容
   */
  update: (id, content) => callCloudFunction('comment', {
    action: 'update',
    data: { id, content }
  }),
  
  /**
   * 删除评论
   * @param {String} id 评论ID
   */
  delete: (id) => callCloudFunction('comment', {
    action: 'delete',
    data: { id }
  }),
  
  /**
   * 点赞/取消点赞评论
   * @param {String} id 评论ID
   * @param {Boolean} like 是否点赞
   */
  like: (id, like = true) => callCloudFunction('comment', {
    action: 'like',
    data: { id, like }
  })
}
    