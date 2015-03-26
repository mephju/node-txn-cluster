var mysql      	= require('mysql')
var mysqlConfig = require('./mysql-config')
var util 		= require('util')


function DistanceModel(dataset) {
	app.Model.call(this, dataset)
	
	this.insertCount = 0
	this.tableName = this.dataset.name + '_' + this.dataset.config.DISTANCE_MEASURE.replace(/-/g, '_')
	log.cyan('DistanceModel', 'going to get distances from', this.tableName)
	this.dbConfig = {
		host: 'localhost',
		user: mysqlConfig.user,
		password: mysqlConfig.pass,
		database: mysqlConfig.db
	}
	this.db = mysql.createPool(this.dbConfig);

	db.on('error', function(err) {
		log.red('distancemodel mysql error', err)
		if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
			this.db.createPool(this.dbConfig)                         
		} else {                                      
			throw err;                                  
		}
	}.bind(this))
}

DistanceModel.prototype = Object.create(app.Model.prototype, {
	constructor: DistanceModel
})


DistanceModel.prototype.getDistances = function(txnRow, done) {
	this.db.query(
		'select distances from ' + this.tableName + ' where txn_id = ?', 
		txnRow['txn_id'], 
		function(err, results, fields) {
			//log('getDistances got results', results)
			if(err) return done(err)
			done(null, help.textToNumArray(results[0].distances))
		}
	);
}

/**
 * Retrieves the huge pre calculated distances for more txns than one, e.g. 20.
 * 
 * @param  {[type]}   txnRows [description]
 * @param  {Function} done    [description]
 * @return {[type]}           [description]
 */
DistanceModel.prototype.getDistancesForMany = function(txnRows, done) {
	// log('DistanceModel.getDistancesForMany')
	var txnIds = txnRows.map(function(txnRow) { return txnRow['txn_id']}).toString()
	var sql = util.format(
		'select distances from ' + this.tableName + ' where txn_id in (%s) ORDER BY FIND_IN_SET(txn_id, %s)',
		txnIds,
		"'" + txnIds + "'"
	);

	this.db.query(
		sql,
		function(err, results, fields) {
			if(err) return done(err)
			results.forEach(function(row, i) {
				results[i] = help.textToNumArray(row.distances)
			})
			//log(results)
			done(null, results)
		}
	);
}


DistanceModel.prototype.prepare = function(done) {
	log('prepare')
	
	//var distanceMeasureName = this.dataset.config.DISTANCE_MEASURE.replace(/-/g, '_')
	//var tableName = 'distances.distances_' + this.dataset.name + '_' + distanceMeasureName

	async.wfall([
		function(next) {
			this.db.query('DROP TABLE IF EXISTS ' + this.tableName, next)
		},
		function(info, fields, next) {
			this.db.query(
				'CREATE TABLE IF NOT EXISTS ' + this.tableName + 
				'(txn_id MEDIUMINT UNSIGNED NOT NULL PRIMARY KEY, distances MEDIUMTEXT NOT NULL);', next)
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

	async.wfall([
		function(next) {
			this.db.query('COMMIT', next)
		},
		// function(info, fields, next) {
		// 	this.db.query('ALTER TABLE distances.distances ADD INDEX index_on_txn_id(txn_id)')
		// }
	], this, done)
}


DistanceModel.prototype.insert = function(txnRow, distances, done) {
	process.stdout.write('insert all distances of ' + txnRow['txn_id'])
	this.insertCount++
	
	if((this.insertCount % 20) === 0) {
		this.db.query('COMMIT')
	}

	
	this.db.query(
		'INSERT INTO ' + this.tableName + ' VALUES(?, ?)', 
		[txnRow['txn_id'], distances.toString()], 
		function(err, result, fields) {
			log('inserted')
			
			return done(err)
		}
	);

}

module.exports = DistanceModel