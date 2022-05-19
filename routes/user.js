const { Octokit } = require("@octokit/core")
const { createOAuthAppAuth, createOAuthUserAuth } = require("@octokit/auth-oauth-app")
const { _ } = require('../utils/router')
const { m } = require('../utils/models')
const githubKeys = require(process.env.GITHUB_KEYS)

const appOctokit = new Octokit({
  authStrategy: createOAuthAppAuth,
  auth: {
    clientId: githubKeys.id,
    clientSecret: githubKeys.secret,
  },
})

_({
  method: 'GET',
  path: '/api/users/:id',
  handler: [
    async (ctx, next) => {
      try {
        const user = await m('User').findById(ctx.params.id)
        if (!user) {
          return ctx.throw(404, 'not found')
        }
        ctx.body = user
      } catch (e) {
        throw e
      }
    }
  ]
})

_({
  method: 'POST',
  path: '/api/github/auth',
  input: {
    body: {
      code: 'required',
    },
  },
  handler: [
    async (ctx, next) => {
      try {
        const authentication = await appOctokit.auth({
          type: 'oauth-user',
          code: ctx.state.body.code,
        })
        const userOctokit = new Octokit({ auth: authentication.token })
        const userinfo = await userOctokit.request("GET /user")
        const emails = await userOctokit.request("GET /user/emails")

        const data = {
          name: userinfo.data.login,
          avatarUrl: userinfo.data.avatar_url,
          emails: emails.data.map(e => ({
            email: e.email,
            verified: e.verified,
            primary: e.primary,
          })),
          github: {
            id: userinfo.data.id,
            login: userinfo.data.login,
            token: authentication.token,
            tokenType: authentication.tokenType,
            scopes: authentication.scopes,
          },
        }

        let user = await m('User').findOneByGithubId(ctx, data.github.id)
        if (user) {
          if (user.status !== 'active') {
            return ctx.throw(409, 'Account disabled')
          }
          await user.update(ctx, user._id, data)
        } else {
          user = await m('User').create(ctx, data)
        }
        ctx.status = 200
        ctx.body = user.data
      } catch (e) {
        throw e
      }
    }
  ]
})