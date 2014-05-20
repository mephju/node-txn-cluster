var fs 			= require('fs')
var db			= require('./db')
var async		= require('async')

var dataset 	= require('../dataset-defs').dataset()


exports.import = function(callback) {

	var buffer = ''
	var lineCount = 0
	var lastLines = null



	var onLinesAvailable = function(lines, done) {

		lineCount += lines.length

		var records = lines.map(function(line) {
			return line.split(dataset.separator)
		})

		async.waterfall([
			function(next) {
				db.insert(dataset.dbTable, records,  next)				
			},
			function(next) {
			
				if(lastLines) {	
					lines = lastLines
					lastLines = null
					onLinesAvailable(lines, function() {
						console.log('LINE COUNT ' + dataset.datasetPath + ' ' + lineCount)
						callback()
					})
				}
				next(null)	
			}
		], done)
	}




	var readable = fs.createReadStream(dataset.datasetPath, 'utf8')
	
	readable.setEncoding('utf8')
	readable.on('data', function(chunk) {
		
		readable.pause()

		async.waterfall([
			function(next) {
				
				buffer += chunk

				if(buffer.indexOf('\n') !== -1) {
					var lines = buffer.split('\n')	
					buffer = lines.pop()
					onLinesAvailable(lines, next)
				} else {
					next(null)
				}
			},
			function(next) {
				readable.resume()
			}
		])
	})

	


//TODO when end event is triggered the onLinesAvailable may only be called after callback
	readable.on('end', function() {
		if(buffer.indexOf('\n') !== -1) {	  	
			lastLines = buffer.split('\n')
		} else {
			lastLines = [buffer]
		}	
	})

}

