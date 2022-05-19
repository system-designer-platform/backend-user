const fs = require('fs')
const path = require('path')

const read = (container, dir) => {
  const files = fs.readdirSync(dir)
  for (let file of files){
    let name = path.parse(file).name
    if (name.charAt(0) !== '_') {
      file = `${dir}/${file}`
      let stats = fs.statSync(file)
      container[name] = stats.isDirectory() ? read({}, file) : require(file)
    }
  }
  return container
}

module.exports = dir => read({}, dir)