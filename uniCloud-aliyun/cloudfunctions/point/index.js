const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 点位CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createPoint(data, userId)
      case 'get':
        return await getPoint(data)
      case 'update':
        return await updatePoint(data, userId)
      case 'delete':
        return await deletePoint(data, userId)
      case 'like':
        return await likePoint(data, userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('点位操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 创建点位
async function createPoint(data, userId) {
  const { title, description, mapId, images } = data
  if (!title || !description || !mapId || !images || !images.length) {
    throw new Error('标题、说明、地图ID和图片不能为空')
  }
  
  const result = await db.collection('points').add({
    data: {
      ...data,
      userId,
      likes: 0,
      views: 0,
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return {
    code: 0,
    message: '点位创建成功',
    data: { pointId: result._id }
  }
}

// 获取点位（单条或列表）
async function getPoint(params) {
  const { id, mapId, heroId, userId, page = 1, pageSize = 20 } = params
  const collection = db.collection('points')
  
  // 单条查询
  if (id) {
    const point = await collection.doc(id).get()
    if (!point.data) throw new Error('点位不存在')
    
    // 增加浏览量
    await collection.doc(id).update({
      data: { views: _.inc(1) }
    })
    
    return { code: 0, data: point.data }
  }
  
  // 列表查询
  const where = {}
  if (mapId) where.mapId = mapId
  if (heroId) where.heroId = heroId
  if (userId) where.userId = userId
  
  const total = await collection.where(where).count()
  const list = await collection
    .where(where)
    .orderBy('createTime', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get()
  
  return {
    code: 0,
    data: {
      list: list.data,
      total: total.total,
      page,
      pageSize,
      hasMore: page * pageSize < total.total
    }
  }
}

// 更新点位
async function updatePoint(data, userId) {
  const { id, ...updateData } = data
  if (!id) throw new Error('请传入点位ID')
  
  // 验证权限
  const point = await db.collection('points').doc(id).get()
  if (!point.data) throw new Error('点位不存在')
  if (point.data.userId !== userId) throw new Error('没有权限更新此点位')
  
  await db.collection('points').doc(id).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })
  
  return { code: 0, message: '点位更新成功' }
}

// 删除点位
async function deletePoint(data, userId) {
  const { id } = data
  if (!id) throw new Error('请传入点位ID')
  
  // 验证权限
  const point = await db.collection('points').doc(id).get()
  if (!point.data) throw new Error('点位不存在')
  if (point.data.userId !== userId) throw new Error('没有权限删除此点位')
  
  // 删除点位及关联数据
  await db.collection('points').doc(id).remove()
  await db.collection('comments').where({ pointId: id }).remove()
  await db.collection('collections').where({ pointId: id }).remove()
  await db.collection('pointLikes').where({ pointId: id }).remove()
  
  return { code: 0, message: '点位删除成功' }
}

// 点赞/取消点赞
async function likePoint(data, userId) {
  const { id, like = true } = data
  if (!id) throw new Error('请传入点位ID')
  
  // 检查点位是否存在
  const point = await db.collection('points').doc(id).get()
  if (!point.data) throw new Error('点位不存在')
  
  if (like) {
    // 点赞
    const likeRecord = await db.collection('pointLikes')
      .where({ pointId: id, userId })
      .get()
      
    if (likeRecord.data.length > 0) {
      throw new Error('已经点赞过了')
    }
    
    // 新增点赞记录并增加点赞数
    await db.runTransaction(async transaction => {
      await transaction.collection('pointLikes').add({
        data: { pointId: id, userId, createTime: new Date() }
      })
      await transaction.collection('points').doc(id).update({
        data: { likes: _.inc(1) }
      })
    })
    
    return { code: 0, message: '点赞成功' }
  } else {
    // 取消点赞
    await db.runTransaction(async transaction => {
      await transaction.collection('pointLikes')
        .where({ pointId: id, userId })
        .remove()
      await transaction.collection('points').doc(id).update({
        data: { likes: _.inc(-1) }
      })
    })
    
    return { code: 0, message: '取消点赞成功' }
  }
}
    