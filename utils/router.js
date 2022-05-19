const { match } = require('path-to-regexp')
const Validate = require('c-validator')

let endpoints = []

const compose = fns => {
  return (ctx, next) => {
    let rn = fns[fns.length - 1].bind(null, ctx, next)
    for (let n = fns.length - 2; n >= 0; n--) {
      rn = fns[n].bind(null, ctx, rn)
    }
    return rn()
  }
}

const router = () => {
  const index = endpoints.reduce((data, e) => {
    if (!data[e.method]) {
      data[e.method] = []
    }
    data[e.method].push({
      ...e, 
      pathmatch: match(e.path, {}), 
      handler: Array.isArray(e.handler) ? compose(e.handler) : e.handler,
    })
    return data
  }, {})
  return async (ctx, next) => {
    let endpoint
    for (let e of index[ctx.method]) {
      let r = e.pathmatch(ctx.request.path)
      if (r) {
        endpoint = e
        ctx.params = r.params
        break
      }
    }
    if (!endpoint) {
      return ctx.throw(404, 'not found')
    }
    
    let errors = []
    if (endpoint.input) {
      for (let [k, input] of Object.entries(endpoint.input)) {
        let [_input, _errors] = Validate(input, ctx.request[k])
        if (_errors.length) {
          errors = [...errors, ..._errors]
        }
        ctx.state[k] = _input
      }
      if (errors.length) {
        ctx.status = 422
        ctx.body = { errors }
        return
      }
    }
    
    return endpoint.handler(ctx, next)
  }
}

module.exports.router = router
module.exports._ = endpoint => endpoints.push(endpoint)