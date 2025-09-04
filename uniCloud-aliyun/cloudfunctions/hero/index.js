const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 英雄CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createHero(data, userId)
      case 'get':
        return await getHero(data)
      case 'update':
        return await updateHero(data, userId)
      case 'delete':
        return await deleteHero(data, userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('英雄操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 创建英雄
async function createHero(data, userId) {
  const { name, avatar, description, game } = data
  if (!name || !avatar || !description || !game) {
    throw new Error('英雄名称、头像、描述和所属游戏为必填项')
  }
  
  const result = await db.collection('heroes').add({
    data: {
      ...data,
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return {
    code: 0,
    message: '英雄创建成功',
    data: { heroId: result._id }
  }
}

// 获取英雄（单条或列表）
async function getHero(params) {
  const { id, game, page = 1, pageSize = 20 } = params
  const collection = db.collection('heroes')
  
  // 单条查询
  if (id) {
    const res = await collection.doc(id).get()
    if (!res.data) throw new Error('英雄不存在')
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

// 更新英雄
async function updateHero(data, userId) {
  const { id, ...updateData } = data
  if (!id) throw new Error('请传入英雄ID')
  
  // 只有管理员可以更新英雄
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有权限更新英雄')
  }
  
  await db.collection('heroes').doc(id).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })
  
  return { code: 0, message: '英雄更新成功' }
}

// 删除英雄
async function deleteHero(data, userId) {
  const { id } = data
  if (!id) throw new Error('请传入英雄ID')
  
  // 只有管理员可以删除英雄
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有权限删除英雄')
  }
  
  await db.collection('heroes').doc(id).remove()
  return { code: 0, message: '英雄删除成功' }
}
    