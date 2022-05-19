let models = {}

module.exports.m = name => models[name]
module.exports.register = (name, model) => models[name] = model