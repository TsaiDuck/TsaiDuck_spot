const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 地图CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createMap(data, userId)
      case 'get':
        return await getMap(data)
      case 'update':
        return await updateMap(data, userId)
      case 'delete':
        return await deleteMap(data, userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('地图操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 创建地图
async function createMap(data, userId) {
  const { name, thumbnail, description, game } = data
  if (!name || !thumbnail || !description || !game) {
    throw new Error('地图名称、缩略图、描述和所属游戏为必填项')
  }
  
  // 只有管理员可以创建地图
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有权限创建地图')
  }
  
  const result = await db.collection('maps').add({
    data: {
      ...data,
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return {
    code: 0,
    message: '地图创建成功',
    data: { mapId: result._id }
  }
}

// 获取地图（单条或列表）
async function getMap(params) {
  const { id, game, page = 1, pageSize = 20 } = params
  const collection = db.collection('maps')
  
  // 单条查询
  if (id) {
    const res = await collection.doc(id).get()
    if (!res.data) throw new Error('地图不存在')
    return { code: 0, data: res.data }
  }
  
  // 列表查询
  const where = {}
  if (game) where.game = game
  
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

// 更新地图
async function updateMap(data, userId) {
  const { id, ...updateData } = data
  if (!id) throw new Error('请传入地图ID')
  
  // 只有管理员可以更新地图
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有权限更新地图')
  }
  
  await db.collection('maps').doc(id).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })
  
  return { code: 0, message: '地图更新成功' }
}

// 删除地图
async function deleteMap(data, userId) {
  const { id } = data
  if (!id) throw new Error('请传入地图ID')
  
  // 只有管理员可以删除地图
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有权限删除地图')
  }
  
  await db.collection('maps').doc(id).remove()
  return { code: 0, message: '地图删除成功' }
}
    