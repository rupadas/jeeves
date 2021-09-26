const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoUtil = require('../mongoUtil')
const { secret, salt } = require('../config')

module.exports = async (req, res) => {
  const { email, password } = req.body
  try {
    const db = mongoUtil.getDb()
    const user = await db.collection('users').findOne({ email: email })
    if (!user) {
      throw new Error('Email address is not exists')
    }
    const hash = await bcrypt.hash(password, salt)
    if (user.password !== hash) {
      throw new Error('Wrong password')
    }
    const accessToken = jwt.sign({ _id: user._id.toString() }, secret, { expiresIn: '30d' })
    res.json({ message: 'login', accessToken: accessToken })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
