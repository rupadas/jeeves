const axios = require('axios')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoUtil = require('../mongoUtil')
const { secret, salt, mailboxlayer, mailjetKey, mailjetSecret } = require('../config')
const mailjet = require('node-mailjet').connect(mailjetKey, mailjetSecret)
module.exports = async (req, res) => {
  const { email, password } = req.body
  try {
    const db = mongoUtil.getDb()
    const result = await axios({
      method: 'get',
      url: `https://apilayer.net/api/check?access_key=${mailboxlayer}&email=${email}`
    })
    const { format_valid: fv, mx_found: mxf, smtp_check: smtp, disposable } = result.data
    if (fv && mxf && smtp && !disposable) {
      console.log('Valid Email address')
    } else {
      throw new Error('Please enter valid email address email is disposable/mx not availble')
    }
    const user = await db.collection('users').findOne({ email: email })
    if (user) {
      throw new Error('Email address is already exists')
    }
    const hash = await bcrypt.hash(password, salt)
    const info = await db.collection('users').insertOne({
      email: email,
      password: hash,
      createdAt: new Date(),
      updateAt: new Date()
    })
    await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'rupads123@gmail.com',
              Name: 'Rupa Das'
            },
            To: [
              {
                Email: email
              }
            ],
            Subject: 'Greetings from Rupa`s Blog.',
            HTMLPart: '<h3>Dear, Welcome to Rupa`s Blog. May the delivery force be with you!'
          }
        ]
      })
    const accessToken = jwt.sign({ _id: info.insertedId }, secret, { expiresIn: '30d' })
    res.json({ message: 'signup', accessToken: accessToken })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
