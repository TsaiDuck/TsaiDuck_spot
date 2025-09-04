const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 用户CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'register':
        return await registerUser(data, userId)
      case 'getInfo':
        return await getUserInfo(userId)
      case 'update':
        return await updateUser(data, userId)
      case 'login':
        return await loginUser(userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('用户操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 用户注册
async function registerUser(data, userId) {
  // 检查用户是否已注册
  const user = await db.collection('users').doc(userId).get()
  if (user.data) {
    throw new Error('用户已注册')
  }
  
  // 创建新用户
  await db.collection('users').doc(userId).set({
    data: {
      ...data,
      _id: userId,
      createTime: new Date(),
      lastLogin: new Date(),
      role: 'user' // 默认普通用户
    }
  })
  
  return { code: 0, message: '注册成功' }
}

// 获取用户信息
async function getUserInfo(userId) {
  const user = await db.collection('users').doc(userId).get()
  if (!user.data) {
    throw new Error('用户不存在')
  }
  
  return { code: 0, data: user.data }
}

// 更新用户信息
async function updateUser(data, userId) {
  // 不允许更新ID和角色
  const { _id, role, ...updateData } = data
  
  await db.collection('users').doc(userId).update({
    data: {
      ...updateData,
      lastLogin: new Date()
    }
  })
  
  return { code: 0, message: '信息更新成功' }
}

// 用户登录（更新最后登录时间）
async function loginUser(userId) {
  // 检查用户是否存在，不存在则自动注册
  const user = await db.collection('users').doc(userId).get()
  
  if (!user.data) {
    // 自动注册默认用户
    await db.collection('users').doc(userId).set({
      data: {
        _id: userId,
        nickname: '新用户',
        avatar: 'cloud://default-xxx/default-avatar.png',
        createTime: new Date(),
        lastLogin: new Date(),
        role: 'user'
      }
    })
  } else {
    // 更新最后登录时间
    await db.collection('users').doc(userId).update({
      data: { lastLogin: new Date() }
    })
  }
  
  // 返回用户信息
  const userInfo = await db.collection('users').doc(userId).get()
  return { code: 0, data: userInfo.data }
}
    