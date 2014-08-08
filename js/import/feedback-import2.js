var fs 			= require('fs')
var db			= require('./db')
var async		= require('async')

var dataset 	= require('../dataset-defs').dataset()

var readable 	= null
var buffer 		= ''
var callback	= null
var lineCount	= 0
var finished 	= false;

exports.import = function(done) {

	callback = done

	readable = fs.createReadStream(dataset.datasetPath, {
		encoding:'utf8',
		bufferSize:8192
	})
	//readable = fs.createReadStream(dataset.datasetPath,'utf8') 
	readable.on('data', onData)
	readable.on('end', onEnd)
}


var onData = function(chunk) {

	console.log('onData')

	readable.pause()
	
	async.waterfall([
		function(next) {

			console.log('onData2 ', finished)			
			buffer += chunk

			var lines = buffer.split('\n')	
			
			buffer = lines.pop()

			//console.log('line', lines)
			//console.log('buffer', buffer)
			
			lineCount += lines.length
			onLinesAvailable(lines, next)

		},
		function(next) {
			readable.resume()

			if(finished) {
				console.log('data import finished finished ', lineCount)
				return callback(null)
			} 
			next(null)
		}
	], function(err)  {
		if(err) { console.log('err', err) }
	})
}


var onLinesAvailable = function(lines, done) {
	console.log('onLinesAvailable ', lines.length)
	var records = lines.map(function(line) {
		return line.split(dataset.separator)
	})

	db.insert(records,  function(err) {
		console.log('feedback imported', records.length, err)
		done(err)
	})				
}



var onEnd = function() {
	console.log('onEnd ')
	finished = true
}









