const mongodb = require('mongodb')
const mongodbconfig = require(process.env.MONGODB)

module.exports.dbclient = new mongodb.MongoClient(mongodbconfig.connection, { useUnifiedTopology: true })
