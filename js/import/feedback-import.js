var fs 			= require('fs')
var readline 	= require('readline');
var Stream 		= require('stream')
var db			= require('./db')


exports.import = function(dataset, callback) {

	var buffer = ''
	var lineCount = 0
	var lastLines = null



	var onLinesAvailable = function(lines, onLinesFinished) {

		lineCount += lines.length

		var records = lines.map(function(line) {
			return line.split(dataset.separator)
		})

		db.insert(dataset.dbTable, records, function() {
			
			readable.resume()
			
			if(lastLines) {	
				lines = lastLines
				lastLines = null
				onLinesAvailable(lines, function() {
					console.log('LINE COUNT ' + dataset.datasetPath + ' ' + lineCount)
					callback()
				})
			}

			if(onLinesFinished) {
				onLinesFinished()
			}	
		})
	}




	var readable = fs.createReadStream(dataset.datasetPath, 'utf8')
	
	readable.setEncoding('utf8')
	readable.on('data', function(chunk) {
		readable.pause()
		//console.log('data')
	  buffer += chunk

	  if(buffer.indexOf('\n') !== -1) {
		var lines = buffer.split('\n')	
		buffer = lines.pop()
		onLinesAvailable(lines)
	  }
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

