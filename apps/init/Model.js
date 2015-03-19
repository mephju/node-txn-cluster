var sqlite3 = require('sqlite3')


function Model(dataset) {
	this.dataset = dataset
	this.db = new sqlite3.Database(dataset.dbPath)
}

module.exports = exports = Model


Model.prototype.tableSize = function(table, callback) {
	log('getTableSize')
	var model = this
	
	async.wfall([
		function(next) {
			this.db.get('SELECT count(*) as count FROM ' + table, next)
		},
		function(row, next) {
			callback(null, row.count)
		}
	], this, callback)
}

Model.prototype.trainingSetSize = function(done) {
	async.wfall([
		function(next) {
			this.tableSize('txns', next)
		},
		function(tableSize, next) {
			var trainingSetSize = Math.floor(tableSize * this.dataset.config.TRAINING_SET_SIZE)
			done(null, trainingSetSize)
		}
	],this, done)
}