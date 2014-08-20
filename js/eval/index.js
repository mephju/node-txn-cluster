
var async		= require('async')
var txnDb		= require('../transactions/db')
var baseline 	= require('./most-popular')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')
var eval 		= require('./eval')

var recommender = null

if(config.RECOMMENDER === config.REC_REAL) {
	recommender = require('../recommend/')
} 
else if(config.RECOMMENDER === config.REC_APRIORI) {
	recommender = require('../apriori')
}


var baselineItems = null


var start = function(callback) {
	async.waterfall([
		function(next) {
			baseline.init(next)
		},
		function(next) {
			baselineItems = baseline.getPopularItemsForN(config.N)
			next(null)
		},
		function(next) {
			var fallbackItems = baselineItems
			recommender.init(fallbackItems, next)
		},
		function(next) {
			var isValidation = true
			txnDb.getAllTxns(next, isValidation)
		},
		function(txnRows, next) {
			console.log('txnRows', txnRows.length)

			var validTxnRows = filterValidTxns(txnRows)

			console.log('validtxnRows', validTxnRows.length)


			var precision = eval.evaluate(
				validTxnRows, 
				baselineItems, 
				recommender
			);			
			
			console.log('###########################################')
			console.log('Recommender Precision', precision.precR)
			console.log('Baseline Precision', precision.precB)
			if(config.RECOMMENDER === config.REC_REAL) {
				console.log('number of clusters: ', recommender.clusters.clusters.length)
			}
			callback(null, precision)

		}
	], 
	function(err) {
		console.log(err) 
		if(callback) { 			
			callback(err) 
		}
	})
}


var filterValidTxns = function(txnRows) {
	var validTxnRows = []
	txnRows.forEach(function(txnRow) {
		if(txnRow['item_ids'].length > config.N) {
			validTxnRows.push(txnRow)	
		}
	})
	return validTxnRows
}








exports.start = start
//start()

var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}