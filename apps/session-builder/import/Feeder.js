var fs 			= require('fs')
var db			= require('./db')


function Feeder(dataset) {
	this.dataset 	= dataset
}

module.exports = Feeder 



Feeder.prototype.insertLines = function(lines, done) {

	log('insertLines', lines.length)
	var records = []

	var onLine = function(line, next) {
		//process.stdout.write('.')
		records.push(line.split(this.dataset.separator))
		if(records.length < 1000) {
			return next()
		}
		log.yellow('inserting lots of lines')
		db.insert(this.dataset, records, next)
		records = []
	}

	var onEnd = function(err) {
		log('onEnd')
		if(!err && records.length !== 0) {
			db.insert(this.dataset, records, done)
			return records = []
		}
		done(err)
	}

	async.eachSeries(
		lines,
		onLine.bind(this),
		onEnd.bind(this)
	);			
}

Feeder.prototype.import = function(done) {

	log('import data of ', this.dataset.name)

	var content = fs.readFileSync(this.dataset.filepath, {
		encoding:'utf8'
	}).trim();
	var lines = content.split('\n')
	content = null
	this.insertLines(lines, done)
}






	









