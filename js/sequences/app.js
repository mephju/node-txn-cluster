	

var txnApp 			= require('../transactions/app')
var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async 			= require('async')
var seqFind			= require('./seq-find')
var seqStore		= require('./seq-store')






var countSeqs = function(dataset, callback) {
	txnApp.getTxnBatches(
		dataset, 
		function onBatchAvailable(txnIdBatch, txnBatch, next) {
			console.log('onBatchAvailable', txnIdBatch.length)
			var txnSeqStore	= seqFind.inTxnBatch2(txnBatch)
			seqStore.store(txnSeqStore, dataset, next)
		},
		function(err) {
			console.log('getTxnBatches error', err)
			callback(err)
		}
	);
}









// 	getIds for dataset
// 	create id batches
// 	foreach id batch
// 		get txns
// 		find seqs in txns
// 		counts seqs



exports.findSequences = function(callback) {
	async.waterfall([
		function(next) {
			seqStore.init(dataset, next)
		},
		function(next) {
			countSeqs(dataset, next)
		},
		function(next) { 
			seqStore.createFreqSeqView(dataset, next)
		}
	], 
	function(err) { 
		console.log('sequences - finished with dataset', err)
		callback(err)
	})
}