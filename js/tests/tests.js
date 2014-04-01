var fs 				= require('fs')
var readline 	= require('readline');
var Stream 		= require('stream')
var db				= require('./db')



exports.test2 = function(callback) {


	var instream = fs.createReadStream('/home/mephju/schmierblatt.txt');
	var outstream = new Stream;
	var rl = readline.createInterface(instream, outstream);

	var lines = []

	rl.on('line', function(line) {
		lines.push(line)
		console.log('###')
		console.log(line)
		rl.pause()
		
	});


	rl.on('pause', function() {
		console.log('pause ' + lines.length)
		setTimeout(function() { 
			console.log('processing done...resume')
			lines = []
			rl.resume()
		}, 1000)
	})


	rl.on('close', function() {
	  console.log('close')
	});
}




exports.test1 = function(dataset, callback) {

	var readable = fs.createReadStream('/home/mephju/schmierblatt.txt', 'utf8')
	readable.setEncoding('utf8')
	
	var done = false

	readable.on('data', function(chunk) {
		console.log('data')
		readable.pause()
		//console.log('begin')
		
		setTimeout(function() { 
			console.log('data processed')
			readable.resume();

			
			if(done) {
				callback()
			}
		}, 1000)
	})

	readable.on('end', function() {
		console.log('stream finished')
		done = true
	})
}