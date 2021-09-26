const ObjectId = require('mongodb').ObjectID
const mongoUtil = require('../mongoUtil')
module.exports = async (req, res) => {
  try {
    const { _id } = req.user
    const { message, postID } = req.body
    const db = mongoUtil.getDb()
    const post = await db.collection('posts').findOne({ _id: ObjectId(postID) })
    if (!post) {
      throw new Error('Post not exists')
    }
    const info = await db.collection('comments').insertOne({
      userID: ObjectId(_id),
      postID: ObjectId(postID),
      message: message,
      createdAt: new Date(),
      updateAt: new Date()
    })
    const comment = await db.collection('comments').findOne({ _id: info.insertedId })
    res.json({ item: comment })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
