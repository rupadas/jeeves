const aws = require('aws-sdk')
const express = require('express')
const router = express.Router()
const Joi = require('joi')
const validator = require('express-joi-validation').createValidator({ passError: true })
const jwt = require('jsonwebtoken')
const multer = require('multer')
const multerS3 = require('multer-s3')
const { secret, secretAccessKey, accessKeyId, s3Bucket } = require('../config')

const s3 = new aws.S3({
  apiVersion: '2006-03-01',
  secretAccessKey: secretAccessKey,
  accessKeyId: accessKeyId
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: s3Bucket,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '_' + file.originalname)
    }
  })
})

router.post('/login', validator.body(Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().error(new Error('Please enter valid email')),
  password: Joi.string().min(3).max(15).required().error(new Error('Please enter valid password'))
})), require('./login'))

router.post('/signup', validator.body(Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).required().error(new Error('Please enter valid email')),
  password: Joi.string().min(3).max(15).required().error(new Error('Please enter valid password'))
})), require('./signup'))

const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization
  try {
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      const user = await jwt.verify(token, secret)
      req.user = user
      next()
    } else {
      res.sendStatus(401)
    }
  } catch (e) {
    res.sendStatus(403)
  }
}

router.get('/topics', authenticateJWT, require('./topics'))
router.post('/topics', authenticateJWT, validator.body(Joi.object({
  name: Joi.string().required().error(new Error('Please enter valid topic name'))
})), require('./create_topic'))

router.get('/posts', authenticateJWT, require('./posts'))
router.post('/posts', authenticateJWT, validator.body(Joi.object({
  title: Joi.string().required().error(new Error('Please enter valid title')),
  description: Joi.string().required().error(new Error('Please enter valid description')),
  topicID: Joi.string().required().error(new Error('Please enter valid topicID')),
  images: Joi.array().items(Joi.string())
})), require('./create_post'))

router.post('/comments', authenticateJWT, validator.body(Joi.object({
  postID: Joi.string().required().error(new Error('Please enter valid postID')),
  message: Joi.string().required().error(new Error('Please enter valid message'))
})), require('./create_comment'))

router.post('/upload', authenticateJWT, upload.array('photos'), async (req, res, next) => {
  const images = req.files.map(x => x.location)
  res.json({ items: images })
})

router.use((err, req, res, next) => {
  if (err && err.error) {
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      error: err.error.message
    })
  } else {
    next(err)
  }
})

module.exports = router
