const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

// 投稿CRUD云函数
exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const userId = wxContext.OPENID
  
  try {
    switch (action) {
      case 'create':
        return await createSubmission(data, userId)
      case 'getList':
        return await getSubmissions(data, userId)
      case 'update':
        return await updateSubmission(data, userId)
      case 'delete':
        return await deleteSubmission(data, userId)
      case 'review':
        return await reviewSubmission(data, userId)
      default:
        return { code: 1, message: '未知操作类型' }
    }
  } catch (err) {
    console.error('投稿操作失败:', err)
    return { code: 1, message: err.message }
  }
}

// 创建投稿
async function createSubmission(data, userId) {
  const { title, description, mapId, images } = data
  if (!title || !description || !mapId || !images || !images.length) {
    throw new Error('标题、说明、地图ID和图片不能为空')
  }
  
  const result = await db.collection('submissions').add({
    data: {
      ...data,
      userId,
      status: 'pending',
      createTime: new Date(),
      updateTime: new Date()
    }
  })
  
  return {
    code: 0,
    message: '投稿成功，等待审核',
    data: { submissionId: result._id }
  }
}

// 获取投稿列表
async function getSubmissions(params, userId) {
  const { status, page = 1, pageSize = 20, isAdmin = false } = params
  const collection = db.collection('submissions')
  
  // 构建查询条件
  const where = {}
  if (status) where.status = status
  // 普通用户只能看到自己的投稿
  if (!isAdmin) where.userId = userId
  
  // 获取总数
  const total = await collection.where(where).count()
  
  // 获取列表
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

// 更新投稿（仅待审核状态可更新）
async function updateSubmission(data, userId) {
  const { id, ...updateData } = data
  if (!id) throw new Error('请传入投稿ID')
  
  // 验证权限和状态
  const submission = await db.collection('submissions').doc(id).get()
  if (!submission.data) throw new Error('投稿不存在')
  if (submission.data.userId !== userId) throw new Error('没有权限更新此投稿')
  if (submission.data.status !== 'pending') throw new Error('只有待审核的投稿可以修改')
  
  await db.collection('submissions').doc(id).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })
  
  return { code: 0, message: '投稿更新成功' }
}

// 删除投稿（仅待审核状态可删除）
async function deleteSubmission(data, userId) {
  const { id } = data
  if (!id) throw new Error('请传入投稿ID')
  
  // 验证权限和状态
  const submission = await db.collection('submissions').doc(id).get()
  if (!submission.data) throw new Error('投稿不存在')
  if (submission.data.userId !== userId) throw new Error('没有权限删除此投稿')
  if (submission.data.status !== 'pending') throw new Error('只有待审核的投稿可以删除')
  
  await db.collection('submissions').doc(id).remove()
  return { code: 0, message: '投稿删除成功' }
}

// 审核投稿（仅管理员）
async function reviewSubmission(data, userId) {
  const { id, status, reason = '' } = data
  if (!id || !status) throw new Error('请传入投稿ID和审核状态')
  if (!['approved', 'rejected'].includes(status)) {
    throw new Error('审核状态只能是approved或rejected')
  }
  
  // 验证管理员权限
  const user = await db.collection('users').doc(userId).get()
  if (!user.data || user.data.role !== 'admin') {
    throw new Error('没有审核权限')
  }
  
  // 验证投稿存在
  const submission = await db.collection('submissions').doc(id).get()
  if (!submission.data) throw new Error('投稿不存在')
  if (submission.data.status !== 'pending') throw new Error('只能审核待审核的投稿')
  
  // 执行审核
  const updateData = {
    status,
    reviewerId: userId,
    reviewTime: new Date(),
    updateTime: new Date()
  }
  
  if (status === 'rejected') {
    updateData.reason = reason
  }
  
  // 如果审核通过，将投稿转为正式点位
  if (status === 'approved') {
    await db.runTransaction(async transaction => {
      // 更新投稿状态
      await transaction.collection('submissions').doc(id).update({ data: updateData })
      
      // 创建正式点位
      const submissionData = submission.data
      await transaction.collection('points').add({
        data: {
          title: submissionData.title,
          description: submissionData.description,
          heroId: submissionData.heroId,
          mapId: submissionData.mapId,
          images: submissionData.images,
          coordinates: submissionData.coordinates,
          difficulty: submissionData.difficulty,
          tags: submissionData.tags,
          userId: submissionData.userId,
          likes: 0,
          views: 0,
          createTime: new Date(),
          updateTime: new Date()
        }
      })
    })
  } else {
    // 审核不通过，只更新状态
    await db.collection('submissions').doc(id).update({ data: updateData })
  }
  
  return { 
    code: 0, 
    message: status === 'approved' ? '审核通过' : '审核不通过' 
  }
}
    