
var Datastore = require('nedb')

function EvalModel(dataset) {
	app.EvalModel.call(this, dataset)

	this.filepath  = dataset.resultPath + 'evaluation.db'

	this.db = new Datastore({ 
		filename: filepath,
		autoload: true
	});
}

// EvalModel.prototype = Object.create(app.EvalModel.prototype, {
// 	constructor: EvalModel
// })

module.exports = exports = EvalModel



EvalModel.prototype.insert = function(precision, done) {

	var result = {
		createdAt: new Date(),
		dataset: this.dataset,
		precision: precision,
	}

	this.db.insert(result, done)
}