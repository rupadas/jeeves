const { MongoClient } = require('mongodb')
const { mongodbUser, mongodbPassword, mongodbHost } = require('./config')
const url = `mongodb+srv://${mongodbUser}:${mongodbPassword}@${mongodbHost}/?retryWrites=true&w=majority`

let _db

module.exports = {
  connectToServer: async () => {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })
    await client.connect()
    _db = client.db('blog')
    return _db
  },
  getDb: function () {
    return _db
  }
}
