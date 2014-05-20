var txnBuilder = require('./txn-builder')
var db = require('./db')
var async = require('async')
var config = require('../config')
var help = require('../help')

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
	txnBuilder.buildTxnsForSet(callback)

}



//
// getTxnBatches(txnIds, onBatch, callback)
// getTxnBatches(onBatch, callback)
// onBatch(idbatch, txnbatch, next);
// 
var getTxnBatches = function() {

	var arglen = arguments.length
	var callback = arguments[arglen-1]
	var onBatch = null

	var processIdBatches = function(txnIds, next) {
		var txnIdBatches = help.toBatches(txnIds)
		forTxnIdBatches(txnIdBatches, onBatch, next)
	}

	if(arglen === 3) {
		var txnIds = arguments[0]
		onBatch = arguments[1]
		processIdBatches(txnIds, callback)
	} else if(arglen === 2) {
		onBatch = arguments[0]
		async.waterfall([
			db.getAllTxnIds,
			processIdBatches
		], callback)
	}
}




exports.buildTxns = buildTxns
exports.getTxnBatches = getTxnBatches



var forTxnIdBatches = function(txnIdBatches, onBatch, callback) {

	async.eachSeries(
		txnIdBatches,
		function(txnIdBatch,  next) {
			async.waterfall([
				function(next) {
					db.getManyTxns(txnIdBatch, next)
				},
				function(txnBatch, next) {
					console.log('got batch from db', txnIdBatch.length)
					onBatch(txnIdBatch, txnBatch, next)
				}
			],
			next)

		},
		callback
	);
}




