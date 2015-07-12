var fs 			= require('fs')
var db			= require('./db')
var readline  	= require('readline')
var lineReader 	= require('line-reader')


function Feeder(dataset) {
	this.dataset 	= dataset
}

module.exports = Feeder 

const LINES_MAX = 100000


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

	lineReader.eachLine(this.dataset.filepath, function(line, last, next) {
		lines.push(line)

		if(last || lines.length === LINES_MAX) {
			return feeder.insertLines(lines, function(err) {
				lines.length = 0
				log(last)
				if(last) { return done(err) }
				next()

			})
		} 
		next()
		
			
	})	
}






	









