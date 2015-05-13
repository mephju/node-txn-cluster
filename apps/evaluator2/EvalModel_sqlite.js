var sqlite3 = require('sqlite3')


function EvalModel(dataset) {
	app.EvalModel.call(this, dataset)

	this.filepath  = dataset.resultPath + 'evaluation.db'
	this.db = new sqlite3.Database(this.filepath)
}

// EvalModel.prototype = Object.create(app.Model.prototype, {
// 	constructor: EvalModel
// })

module.exports = exports = EvalModel


EvalModel.prototype.init = function(done) {
	var create = 'CREATE TABLE IF NOT EXISTS evaluation ( \
			dataset_name
		);'
	async.waterfall([
		function(next) {
			this.db.run()
		},
		function(next) {
	
		}
	])
}

EvalModel.prototype.insert = function(precision, done) {


}