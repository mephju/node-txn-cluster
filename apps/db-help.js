

var getTableSize = function(db, table, callback) {
	log('getTableSize')
	async.waterfall([
		function(next) {
			db.get('SELECT count(*) as count FROM ' + table, next)
		},
		function(row, next) {
			console.log(row)
			callback(null, row.count)
		}
	], callback)
}

exports.getTrainingSetSize = function(db, done) {
	async.waterfall([
		function(next) {
			getTableSize(db, 'txns', next)
		},
		function(size, next) {
			var trainingSetSize = Math.floor(size*config.TRAINING_SET_SIZE)
			log('getTrainingSetSize', trainingSetSize)
			done(null, trainingSetSize)
		}
	], done)
}
exports.getTableSize = getTableSize
