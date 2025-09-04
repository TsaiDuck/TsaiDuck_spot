const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 评论CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createComment(data, userId)
      case 'get':
        return await getComments(data)
      case 'update':
        return await updateComment(data, userId)
      case 'delete':
        return await deleteComment(data, userId)
      case 'like':
        return await likeComment(data, userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('评论操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 创建评论
async function createComment(data, userId) {
  const { pointId, content } = data
  if (!pointId || !content) {
    throw new Error('点位ID和评论内容不能为空')
  }
  
  // 检查点位是否存在
  const point = await db.collection('points').doc(pointId).get()
  if (!point.data) {
    throw new Error('关联的点位不存在')
  }
  
  // 如果是回复，获取父评论信息
  let floor = 0
  if (!data.parentId) {
    // 主评论，计算楼层号
    const count = await db.collection('comments')
      .where({ pointId, parentId: _.eq(null) })
      .count()
    floor = count.total + 1
  }
  
  const result = await db.collection('comments').add({
    data: {
      ...data,
      userId,
      floor,
      likes: 0,
      createTime: new Date()
    }
  })
  
  return {
    code: 0,
    message: '评论成功',
    data: { commentId: result._id, floor }
  }
}

// 获取评论列表
async function getComments(params) {
  const { pointId, page = 1, pageSize = 20 } = params
  if (!pointId) throw new Error('请传入点位ID')
  
  // 先获取主评论
  const mainComments = await db.collection('comments')
    .where({ pointId, parentId: _.eq(null) })
    .orderBy('createTime', 'asc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  // 获取总条数
  const total = await db.collection('comments')
    .where({ pointId, parentId: _.eq(null) })
    .count()
  
  // 获取每条主评论的回复
  const commentList = await Promise.all(
    mainComments.data.map(async (comment) => {
      const replies = await db.collection('comments')
        .where({ parentId: comment._id })
        .orderBy('createTime', 'asc')
        .get()
      
      return {
        ...comment,
        replies: replies.data
      }
    })
  )
  
  return {
    code: 0,
    data: {
      list: commentList,
      total: total.total,
      page,
      pageSize,
      hasMore: page * pageSize < total.total
    }
  }
}

// 更新评论
async function updateComment(data, userId) {
  const { id, content } = data
  if (!id || !content) throw new Error('评论ID和内容不能为空')
  
  // 验证权限
  const comment = await db.collection('comments').doc(id).get()
  if (!comment.data) throw new Error('评论不存在')
  if (comment.data.userId !== userId) throw new Error('没有权限修改此评论')
  
  await db.collection('comments').doc(id).update({
    data: { content }
  })
  
  return { code: 0, message: '评论更新成功' }
}

// 删除评论
async function deleteComment(data, userId) {
  const { id } = data
  if (!id) throw new Error('请传入评论ID')
  
  // 验证权限
  const comment = await db.collection('comments').doc(id).get()
  if (!comment.data) throw new Error('评论不存在')
  if (comment.data.userId !== userId) throw new Error('没有权限删除此评论')
  
  // 如果是主评论，同时删除所有回复
  if (!comment.data.parentId) {
    await db.collection('comments').where({ parentId: id }).remove()
  }
  
  // 删除评论及点赞记录
  await db.collection('comments').doc(id).remove()
  await db.collection('commentLikes').where({ commentId: id }).remove()
  
  return { code: 0, message: '评论删除成功' }
}

// 评论点赞/取消点赞
async function likeComment(data, userId) {
  const { id, like = true } = data
  if (!id) throw new Error('请传入评论ID')
  
  if (like) {
    // 点赞
    const likeRecord = await db.collection('commentLikes')
      .where({ commentId: id, userId })
      .get()
      
    if (likeRecord.data.length > 0) {
      throw new Error('已经点赞过了')
    }
    
    await db.runTransaction(async transaction => {
      await transaction.collection('commentLikes').add({
        data: { commentId: id, userId, createTime: new Date() }
      })
      await transaction.collection('comments').doc(id).update({
        data: { likes: _.inc(1) }
      })
    })
    
    return { code: 0, message: '点赞成功' }
  } else {
    // 取消点赞
    await db.runTransaction(async transaction => {
      await transaction.collection('commentLikes')
        .where({ commentId: id, userId })
        .remove()
      await transaction.collection('comments').doc(id).update({
        data: { likes: _.inc(-1) }
      })
    })
    
    return { code: 0, message: '取消点赞成功' }
  }
}
    