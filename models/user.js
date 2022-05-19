const moment = require('moment')
const fetch = require('node-fetch')
const ObjectID = require('mongodb').ObjectID
const { dbclient } = require('../utils/database')
const { register } = require('../utils/models')

const UserCollection = dbclient.db('user').collection('users')

class User {
  constructor(ctx, data) {
    this.ctx = ctx
    this.data = data
  }
  update = async (ctx, id, data) => {
    try {
      await UserCollection.updateOne({ _id: ObjectID(id) }, { $set: data })
      this.data = { ...this.data, ...data }
    } catch (e) {
      throw e
    }
  }
  static findById = async (ctx, id) => {
    try {
      const result = await UserCollection.findOne({ _id: ObjectID(id) })
      return result ? new User(ctx, data) : null
    } catch (e) {
      throw e
    }
  }
  static findByGithubId = async (ctx, githubId) => {
    try {
      const result = await UserCollection.findOne({ 'github.id': data.github.id })
      return result ? new User(ctx, data) : null
    } catch (e) {
      throw e
    }
  }
  static create = async (ctx, data) => {
    try {
      const result = await User.insertOne({
        ...data,
        status: 'active',
        createdAt: moment().unix(),
      })
      return new User({ctx, ...data, _id: ObjectID(result.insertedId) })
    } catch (e) {
      throw e
    }
  }
}

register('User', User)