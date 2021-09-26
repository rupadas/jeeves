const ObjectId = require('mongodb').ObjectID
const mongoUtil = require('../mongoUtil')
module.exports = async (req, res) => {
  try {
    const { _id } = req.user
    const { name } = req.body
    const db = mongoUtil.getDb()
    const info = await db.collection('topics').insertOne({
      userID: ObjectId(_id),
      name: name,
      createdAt: new Date(),
      updateAt: new Date()
    })
    const topic = await db.collection('topics').findOne({ _id: info.insertedId })
    res.json({ item: topic })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
