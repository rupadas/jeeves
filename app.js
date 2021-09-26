const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 9000
const mongoUtil = require('./mongoUtil')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.get('/', async (req, res) => {
  res.send('hello api')
})
app.use('/blog', require('./blog'))

const run = async () => {
  try {
    await mongoUtil.connectToServer()
    console.log('App is connected to mongodb url')
    await app.listen(port)
    console.log(`App listening at http://localhost:${port}`)
  } catch (e) {
    console.log(e.message)
  }
}

run()
