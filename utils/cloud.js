/**
 * 云函数调用封装
 * @param {String} name 云函数名称
 * @param {Object} data 传递给云函数的参数
 * @returns {Promise} 返回云函数处理结果
 */
export const callCloudFunction = async (name, data = {}) => {
  // 显示加载提示
  uni.showLoading({
    title: '加载中...',
    mask: true
  })
  
  try {
    // 调用云函数
    const result = await uniCloud.callFunction({
      name,
      data
    })
    
    // 处理云函数返回结果
    const res = result.result || {}
    
    // 检查是否有错误
    if (res.code !== 0) {
      throw new Error(res.message || '操作失败')
    }
    
    return res.data
  } catch (err) {
    // 错误处理
    console.error(`调用云函数${name}失败:`, err)
    uni.showToast({
      title: err.message || '操作失败',
      icon: 'none',
      duration: 3000
    })
    throw err // 抛出错误，让调用方可以进一步处理
  } finally {
    // 隐藏加载提示
    uni.hideLoading()
  }
}

/**
 * 云存储上传文件
 * @param {String} tempFilePath 本地临时文件路径
 * @param {String} cloudPath 云存储路径
 * @returns {Promise} 返回上传结果
 */
export const uploadFile = async (tempFilePath, cloudPath) => {
  uni.showLoading({ title: '上传中...', mask: true })
  
  try {
    const result = await uniCloud.uploadFile({
      cloudPath,
      fileContent: Buffer.from(await uni.getFileSystemManager().readFileSync(tempFilePath))
    })
    
    if (!result.fileID) {
      throw new Error('文件上传失败')
    }
    
    return result.fileID
  } catch (err) {
    console.error('文件上传失败:', err)
    uni.showToast({
      title: '文件上传失败',
      icon: 'none',
      duration: 3000
    })
    throw err
  } finally {
    uni.hideLoading()
  }
}
    