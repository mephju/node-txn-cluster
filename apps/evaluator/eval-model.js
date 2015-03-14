
var Datastore = require('nedb')
var fs = require('fs')


function Model(dataset) {
	app.Model.call(this, dataset)

	this.db = new Datastore({ 
		filename: dataset.basePath + 'results/evaluation.db', 
		autoload: true
	});
}

Model.prototype = Object.create(app.Model.prototype, {
	constructor: Model
})

exports.Model = Model

Model.prototype.insert = function(precision, done) {
	
	var filepath = this.dataset.basePath + 'results/evaluation.txt'
	var _this = this
	var result = {
		createdAt: new Date(),
		dataset: this.dataset,
		precision: precision,
	}

	async.waterfall([
		function(next) {
			_this.db.insert(result, next)
		},
		function(inserted, next) {
			
			var data = JSON.stringify(result)
			fs.appendFile(filepath, result, next)
		},
		function(next) {
			fs.appendFile(filepath, '\n\n\n\n ################ \n\n\n\n', next)
		}
	], done)
}