const ObjectId = require('mongodb').ObjectID
const mongoUtil = require('../mongoUtil')
module.exports = async (req, res) => {
  try {
    const { _id } = req.user
    const { title, description, topicID, images } = req.body
    const db = mongoUtil.getDb()
    const topic = await db.collection('topics').findOne({ _id: ObjectId(topicID) })
    if (!topic) {
      throw new Error('Topic not exists')
    }
    const info = await db.collection('posts').insertOne({
      userID: ObjectId(_id),
      topicID: ObjectId(topicID),
      title: title,
      description: description,
      images: images || [],
      createdAt: new Date(),
      updateAt: new Date()
    })
    const post = await db.collection('posts').findOne({ _id: info.insertedId })
    res.json({ item: post })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
