var test = {
  'func': function() {
    console.log('function is called')
  }
}

exports.test = test


var file    = process.argv[1]
var method  = process.argv[2]
if(file === __filename) {
  console.log('called via cmd')
  if(method) {
    exports[method]()
  }
  else {

  }
} else {
  console.log('not called via cmd')
}