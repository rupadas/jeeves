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
    const topics = await db.collection('topics').find({}).limit(Number(limit)).skip(Number(skip)).toArray()
    res.json({ items: topics })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
