var async 		= require('async')
var sql 		= require('./txn-vector-db-sql')
var sqlite3		= require('sqlite3').verbose()
var config		= require('../config')
var sequenceDb 	= require('../sequences/seq-store')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())





var createTableTxnVector = function(dataset, callback) {
	db.run(sql.table.txnVector.create(), callback)
}
var dropTableTxnVector = function(dataset, callback) {
	db.run(sql.table.txnVector.drop(), callback)
}


var insertBatch = function(txnIdBatch, vectorBatch, callback) {
	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		}, 
		function(next) {
			insertBatchHelp(txnIdBatch, vectorBatch, next)		
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	],
	function(err) {
		console.log('txnVector.insertBatch done', err)
		callback(err)
	})
}





var insertBatchHelp = function(txnIdBatch, vectorBatch, callback) {

	async.times(txnIdBatch.length, function(i, next) {
		//console.log('inserting txnvector ', i, txnIdBatch[i], vectorBatch[i])
		db.run(
			sql.table.txnVector.insert(dataset.dbTable), 
			[txnIdBatch[i], JSON.stringify(vectorBatch[i])],
			next
		);
	},
	function(err, res) {
		callback(err)
	})

}



var getTxnVectors = function(onBatch, callback) {

	async.waterfall([
		
		function(next) {
			getTxnVectorHelp(onBatch, next)
		}
	],
	callback);
}


var getTxnVectorHelp = function(onBatch, callback) {
	//+1 for txnid that's going to be saved


	var txnVectors = []
	db.each(
		sql.table.txnVector.select(dataset.dbTable), 
		function(err, row) {
			txnVectors.push(row)
			if((txnVectors.size % config.TXN_VECTOR_BATCH_SIZE) == 0) {
				onBatch(txnVectors)
				txnVectors = []
			}
		},
		function(err, numRows) {
			if(txnVectors.length > 0) {
				onBatch(txnVectors)
			}
			callback(err)
		}

	);
}


var getTxnVectorIds = function(callback) {
	getTxnIds(
		sql.table.txnVector.getTxnIds(), 
		callback
	);
}

var getNonVectorIds = function(callback) {
	getTxnIds(
		sql.table.txnVector.getNonVectorIds, 
		callback
	);
}

var getTxnIds = function(stmt, callback) {
	var txnIds = []
	db.each(
		stmt,
		function(err, row) {
			txnIds.push(row['txn_id'])
		},
		function(err, numRows) {
			console.log('txnvectordb.getTxnIds', txnIds.length)
			callback(err, txnIds)
		}
	);
}


var getTxnVector = function(txnId, callback) {
	db.get(
		sql.table.txnVector.getTxnVector(dataset.dbTable),
		[txnId],
		function(err, row) {
			callback(err, JSON.parse(row.vector))
		}
	);
}

var getManyTxnVectors = function(txnIds, callback) {

	var sqlstmt = sql.table.txnVector.getManyTxnVectors(dataset.dbTable) + 
		'(' + txnIds.toString() + ')'

	db.all(
		sqlstmt,
		function(err, rows) {
			callback(err, rows.map(function(row) {
				return JSON.parse(row.vector)
			}));
		}
	);
	

		
}

exports.createTableTxnVector 	= createTableTxnVector
exports.dropTableTxnVector 		= dropTableTxnVector
exports.insertBatch 			= insertBatch
exports.getTxnVectors 			= getTxnVectors
exports.getTxnVector 			= getTxnVector
exports.getTxnVectorIds 		= getTxnVectorIds
exports.getNonVectorIds 		= getNonVectorIds
exports.getManyTxnVectors		= getManyTxnVectors