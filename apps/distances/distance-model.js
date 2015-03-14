var mysql      = require('mysql')


function DistanceModel(dataset) {
	app.Model.call(this, dataset)
	
	this.insertCount = 0
	this.tableName = this.dataset.name + '-' + this.dataset.config.DISTANCE_MEASURE
	this.db = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: 'love5lin6',
		database: 'distances'
	});
}

DistanceModel.prototype = Object.create(app.Model.prototype, {
	constructor: DistanceModel
})


DistanceModel.prototype.getDistances = function(txnRow, done) {
	this.db.query(
		'select distances from distances.distances where txn_id = ?', 
		txnRow['txn_id'], 
		function(err, results, fields) {
			if(err) return done(err)
			done(null, help.textToNumArray(results[0].distances.toString('utf8')))
		}
	);
}


DistanceModel.prototype.prepare = function(done) {
	log('prepare')
	
	var distanceMeasureName = this.dataset.config.DISTANCE_MEASURE.replace(/-/g, '_')
	var tableName = 'distances.distances_' + this.dataset.name + '_' + distanceMeasureName

	async.wfall([
		function(next) {
			this.db.query('DROP TABLE IF EXISTS ' + tableName, next)
		},
		function(info, fields, next) {
			this.db.query(
				'CREATE TABLE IF NOT EXISTS ' + tableName + 
				'(txn_id MEDIUMINT UNSIGNED NOT NULL, distances MEDIUMTEXT NOT NULL);', next)
		},
		function(info, fields, next) {
			this.db.query('SET autocommit=0', next)
		},
		function(info, fields, next) {
			done()
		}
	], this, done)
}

DistanceModel.prototype.finish = function(done) {
	log('finish')
	this.db.query('COMMIT', function(err, info, fields) {
		done(err)
	})
	// return this.getDistances({txn_id:24906}, function(err, distances) {
	// 	log(distances)
	// })
}


DistanceModel.prototype.insert = function(txnRow, distances, done) {
	process.stdout.write('insert all distances of ' + txnRow['txn_id'])
	this.insertCount++
	
	if((this.insertCount % 20) === 0) {
		this.db.query('COMMIT')
	}

	
	this.db.query(
		'INSERT INTO distances.distances VALUES(?, ?)', 
		[txnRow['txn_id'], distances.toString()], 
		function(err, result, fields) {
			log('inserted')
			
			return done(err)
		}
	);

}

module.exports = DistanceModel