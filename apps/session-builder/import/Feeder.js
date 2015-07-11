var fs 			= require('fs')
var db			= require('./db')
var readline  	= require('readline')


function Feeder(dataset) {
	this.dataset 	= dataset
}

module.exports = Feeder 

const LINES_MAX = 1000


Feeder.prototype.insertLines = function(lines, done) {

	log('insertLines', lines.length)
	var feeder = this
	var records = lines.map(function(line) {
		return line.split(feeder.dataset.separator)
	})
	db.insert(this.dataset, records, done)			
}


Feeder.prototype.import = function(done) {

	log('import data of ', this.dataset.name, this.dataset.filepath)

	var feeder = this
	var lines = []
	var input = fs.createReadStream(this.dataset.filepath)
	log(input)
	var	rl = readline.createInterface(input, null, null)


	rl.on('line', function(line) {

		lines.push(line)
		
		if(lines.length !== LINES_MAX) {
			return
		}
		rl.pause()
		async.waterfall([
			function(next) {
				feeder.insertLines(lines, next)
			},
			function(next) {
				lines.length = 0
				rl.resume()
			}
		], done)
		
	})
	
}






	









