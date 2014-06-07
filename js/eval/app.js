
var async		= require('async')
var txnDb		= require('../transactions/db')
var recommender = require('../recommend/app')
var baseline 	= require('./most-popular')
var config		= require('../config')
var measure 	= require('./measure')
var help 		= require('../help')
var eval 		= require('./eval')

var baselineItems = null


var start = function(callback) {
	async.waterfall([
		function(next) {
			baseline.init(next)
		},
		function(next) {
			recommender.init(next)
		},
		function(next) {
			baselineItems = baseline.getPopularItemsForN(config.N)
			txnDb.getAllTxns(next, true)
		},
		function(txnRows, next) {
			
			var validTxnRows = filterValidTxns(txnRows)

			var precision = eval.evaluate(validTxnRows, baselineItems)			
			
			console.log('###########################################')
			
			console.log('Recommender Precision', precision.precR)
			console.log('Baseline Precision', precision.precB)
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
start()