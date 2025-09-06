import { callCloudFunction } from '../utils/cloud'

/**
 * 用户相关API
 */
export default {
  /**
   * 用户注册
   * @param {Object} data 用户信息
   */
  register: (data) => callCloudFunction('user', {
    action: 'register',
    data
  }),
  
  /**
   * 获取当前用户信息
   */
  getInfo: () => callCloudFunction('user', {
    action: 'getInfo'
  }),
  
  /**
   * 更新用户信息
   * @param {Object} data 要更新的用户信息
   */
  update: (data) => callCloudFunction('user', {
    action: 'update',
    data
  }),
  
  /**
   * 用户登录
   */
  login: () => callCloudFunction('user', {
    action: 'login'
  })
}
    