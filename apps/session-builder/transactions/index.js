var TxnBuilder = require('./txn-builder').TxnBuilder

var async = require('async')



//	fetch all user ids
//	for each user id 
//		get all the feedback ordered by timestamp
//		find coherent groups of feedback by a user
//	 	for each coherent group, 
//			create a txn 
//			for each item of the group
//				create txn item 
exports.buildTxns = function(dataset, done) {
	console.log('txnBuilder.buildTxns for ' + dataset.name)
	new TxnBuilder(dataset).buildTxns(done)

}








