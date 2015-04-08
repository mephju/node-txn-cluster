var sqlite3 = require('sqlite3')

function Model(dataset) {
	
	this.dataset 	= dataset
	this.db 		= new sqlite3.Database(dataset.dbPath)
}

//TODO Call this function before doing anything with any modelsdd
Model.prototype.init = function() {
	this.txns 		= new TxnModel(dataset)
	this.clusters 	= new ClusterModel(dataset)
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

