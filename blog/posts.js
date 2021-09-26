const mongoUtil = require('../mongoUtil')
module.exports = async (req, res) => {
  try {
    const db = mongoUtil.getDb()
    let { page, limit } = req.query
    let skip = 0
    if (!limit) {
      limit = 5
    }
    if (!page) {
      skip = 0
    } else {
      if (Number(page) <= 0) {
        skip = 0
      } else {
        skip = (page - 1) * limit
      }
    }
    let posts = await db.collection('posts').find({}).limit(Number(limit)).skip(Number(skip)).toArray()
    posts = await Promise.all(posts.map(async (x) => {
      x.comments = await db.collection('comments').find({ postID: x._id }).toArray()
      return x
    }))
    res.json({ items: posts })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
