const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 收藏CRUD云函数
exports.main = async (event, context) => {
	const {
		action,
		data
	} = event
	const wxContext = cloud.getWXContext()
	const userId = wxContext.OPENID

	try {
		switch (action) {
			case 'add':
				return await addCollection(data, userId)
			case 'remove':
				return await removeCollection(data, userId)
			case 'getList':
				return await getCollections(data, userId)
			case 'check':
				return await checkCollection(data, userId)
			default:
				return {
					code: 1, message: '未知操作类型'
				}
		}
	} catch (err) {
		console.error('收藏操作失败:', err)
		return {
			code: 1,
			message: err.message
		}
	}
}

// 添加收藏
async function addCollection(data, userId) {
	const {
		pointId
	} = data
	if (!pointId) throw new Error('请传入点位ID')

	// 检查点位是否存在
	const point = await db.collection('points').doc(pointId).get()
	if (!point.data) throw new Error('点位不存在')

	// 检查是否已收藏
	const collection = await db.collection('collections')
		.where({
			pointId,
			userId
		})
		.get()

	if (collection.data.length > 0) {
		throw new Error('已经收藏过了')
	}

	// 添加收藏
	await db.collection('collections').add({
		data: {
			pointId,
			userId,
			createTime: new Date()
		}
	})

	return {
		code: 0,
		message: '收藏成功'
	}
}

// 取消收藏
async function removeCollection(data, userId) {
	const {
		pointId
	} = data
	if (!pointId) throw new Error('请传入点位ID')

	await db.collection('collections')
		.where({
			pointId,
			userId
		})
		.remove()

	return {
		code: 0,
		message: '取消收藏成功'
	}
}

// 获取用户收藏列表
async function getCollections(params, userId) {
	const {
		page = 1, pageSize = 20
	} = params

	// 获取收藏记录
	const collectionResult = await db.collection('collections')
		.where({
			userId
		})
		.orderBy('createTime', 'desc')
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.get()

	// 获取总条数
	const total = await db.collection('collections')
		.where({
			userId
		})
		.count()

	// 获取收藏的点位详情
	const collectionList = await Promise.all(
		collectionResult.data.map(async (item) => {
			const point = await db.collection('points').doc(item.pointId).get()
			return {
				...item,
				pointInfo: point.data || null
			}
		})
	)

	return {
		code: 0,
		data: {
			list: collectionList,
			total: total.total,
			page,
			pageSize,
			hasMore: page * pageSize < total.total
		}
	}
}

// 检查是否已收藏
async function checkCollection(data, userId) {
	const {
		pointId
	} = data
	if (!pointId) throw new Error('请传入点位ID')

	const collection = await db.collection('collections')
		.where({
			pointId,
			userId
		})
		.get()

	return {
		code: 0,
		data: {
			isCollected: collection.data.length > 0
		}
	}
}