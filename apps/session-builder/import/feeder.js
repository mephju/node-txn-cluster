var fs 			= require('fs')
var db			= require('./db')


function Feeder(dataset) {
	this.dataset 	= dataset
	this.buffer 		= ''
	this.lineCount	= 0
	this.finished 	= false;
}

Feeder.prototype.import = function(done) {
	var readable = fs.createReadStream(this.dataset.filepath, {
		encoding:'utf8',
		bufferSize:8192
	})
	var feeder = this
	//readable = fs.createReadStream(dataset.datasetPath,'utf8') 
	var onData = function(chunk) {

		console.log('onData')

		readable.pause()
		
		async.waterfall([
			function(next) {			
				feeder.buffer += chunk
				var lines = feeder.buffer.split('\n')	
				feeder.buffer = lines.pop()
				feeder.lineCount += lines.length
				onLinesAvailable(lines, next)

			},
			function(next) {
				readable.resume()

				if(feeder.finished) {
					console.log('data import finished finished ', feeder.lineCount)
					return done()
				} 
				next(null)
			}
		], 
		function(err)  {
			if(err) { 
				console.log('err', err) 
				return done(err)
			}
		})
	}


	var onLinesAvailable = function(lines, done) {

		console.log('onLinesAvailable ', lines.length)
		
		var records = lines.map(function(line) {
			line = line.split(feeder.dataset.separator)
			//log('length of line', line.length)
			if(line.length != 6) {
				log.red(line)
			}
			return line
		})

		db.insert(feeder.dataset, records,  function(err) {
			console.log('feedback imported', records.length)
			done(err)
		})				
	}



	var onEnd = function() {
		console.log('onEnd ')
		feeder.finished = true
	}


	readable.on('data', onData)
	readable.on('end', onEnd)
}
exports.Feeder = Feeder



	









