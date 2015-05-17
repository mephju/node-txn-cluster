var cp = require('child_process')

var child = cp.fork(__dirname + '/child.js')

child.on('message', function(m, data) {
	console.log('in parent', m, data)
})

child.send('test', function(){})