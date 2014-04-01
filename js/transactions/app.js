var txnBuilder = require('./txn-builder')
var db = require('./db')
var async = require('async')
var config = require('../config')

//	fetch all user ids
//	for each user id 
//		get all the feedback ordered by timestamp
//		find coherent groups of feedback by a user
//	 	for each coherent group, 
//			create a txn 
//			for each item of the group
//				create txn item 
var buildTxns = function(callback) {
	
	var dataset = require('../dataset-defs').dataset()
	
	console.log('txnBuilder.buildTxns for ' + dataset.dbTable)
	txnBuilder.buildTxnsForSet(dataset, callback)

}

var getTxnBatches = function(dataset, onBatch, callback) {
	async.waterfall([
		function(next) { 
			db.getAllTxnIds(dataset, next) 
		},
		function(txnIds, next) {
			var txnIdBatches = makeIdBatches(txnIds)
			forTxnIdBatches(txnIdBatches, onBatch, next)
		},
	], callback)
}



exports.buildTxns = buildTxns
exports.getTxnBatches = getTxnBatches



var forTxnIdBatches = function(txnIdBatches, onBatch, callback) {

	async.eachSeries(
		txnIdBatches,
		function(txnIdBatch,  next) {
			async.waterfall([
				function(next) {
					getTxnBatch(txnIdBatch, next)
				},
				function(txnBatch, next) {
					onBatch(txnIdBatch, txnBatch, next)
				}
			],
			next)

		},
		callback
	);
}




// Split txnIds into batches of txnIds to make batch processing on them
var makeIdBatches = function(txnIds) {

	console.log('makeIdBatches for %d', txnIds.length)

	var txnIdBatches = []
	var txnIdBatch = []
	for(var i=0; i<txnIds.length; i++) {
		txnIdBatch.push(txnIds[i])
		
		if(txnIdBatch.length === config.TXN_ID_BATCH_SIZE || i === txnIds.length-1) {
			txnIdBatches.push(txnIdBatch)
			txnIdBatch = []
		}
	}
	console.log('created %d id batches', txnIdBatches.length)
	return txnIdBatches
}






var getTxnBatch = function(txnIdBatch,callback) {
	var txnBatch = []
	async.eachSeries(
		txnIdBatch,
		function(txnId, next) {
			db.getTxn(txnId, function(err, txn) {
				txnBatch.push(txn)
				next(err)
			})
		},
		function(err) {
			console.log('getTxnBatch',err)
			callback(err, txnBatch)
		}
	);
}