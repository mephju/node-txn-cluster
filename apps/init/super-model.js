var sqlite3 = require('sqlite3')


function Model(dataset) {
	this.dataset = dataset
	this.db = new sqlite3.Database(dataset.dbPath)
}
exports.Model = Model

Model.prototype.tableSize = function(table, callback) {
	log('getTableSize')
	var model = this
	
	async.waterfall([
		function(next) {
			model.db.get('SELECT count(*) as count FROM ' + table, next)
		},
		function(row, next) {
			callback(null, row.count)
		}
	], callback)
}