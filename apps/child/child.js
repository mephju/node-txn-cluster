process.on('message', function(m, data) {
	console.log('in child', m, data)
	process.send('test')
})