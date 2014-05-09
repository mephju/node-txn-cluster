var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var txnDb		= require('../transactions/db')
var recommender = require('../recommend/app')
var baseline 	= require('./most-popular')
var config		= require('../config')
var measure 	= require('./measure')
var txnApp		= require('../transactions/app')
var help 		= require('../help')

var allHits = [0, 0]

var baselineItems = null

var precisionSumBaseline = 0
var precisionSumRecommender = 0

var txnCount = 0

var N = 5









var start = function(callback) {
	async.waterfall([
		function(next) {
			baseline.init(next)
		},
		function(next) {
			baselineItems = baseline.getPopularItemsForN(N)
			txnDb.getTxnIdsForValidation(next)
		},
		function(txnIds, next) {
			txnApp.getTxnBatches(
				txnIds,
				function(txnIds, txns, done) {
					evalOnTxns(txnIds, txns, done)
				},
				next 
			);
		},
		function(next) {
			console.log('###########################################')
			
			precB = precisionSumBaseline / txnCount
			precR = precisionSumRecommender / txnCount

			console.log('Recommender Precision', precR)
			console.log('Baseline Precision', precB)
		}
	], 
	function(err) {
		console.log(err) 
		if(callback) { 			
			callback(err) 
		}
	})
}


var evalOnTxns = function(txnIds, txns, callback) {
	async.eachSeries(
		txns,
		function(txn, next) {

			var shortenedTxns = txn.length > 20 
			? help.toBatches(txn, 20) 
			: [txn]

			async.eachSeries(
				shortenedTxns,
				compare,
				next
			);
		}, 
		callback
	);
}




var compare = function(txn, callback) {
		
	console.log('compare txn with length', txn.length)



	var len = txn.length
	var i = 1;
	var txnPrecision = {
		recommender:[],
		baseline:[]
	}

	async.whilst(
	    function () { 
	    	var result = i < len-N
	    	if(result && i === 1) {
	    		txnCount++
	    	}
	    	return result; 
	    },
	    function (next) {
    		splitTxn(txn, i, function(err, precRecom, precPopular) {
    			txnPrecision.recommender.push(precRecom)
    			txnPrecision.baseline.push(precPopular)
    			next(err)
    		})	
	    	i++
	    },
        function(err) {
        	var r = txnPrecision.recommender
        	var b = txnPrecision.baseline
        	if(r.length > 0) {
	        	precisionSumRecommender += r.reduce(function(left, right) {
	        		return left+right
	        	}) / r.length
	        	precisionSumBaseline += b.reduce(function(left, right) {
	        		return left+right
	        	}) / b.length

	        	console.log('hits R vs B --- %d vs. %d', allHits[0], allHits[1])
			}

        	callback(err)
        }
	);
}


var splitTxn = function(txn, i, callback) {
	
	var sessionBegin 	= txn.slice(0, i)
	var sessionEnd 		= txn.slice(i, i+N)

    getResults(sessionBegin, sessionEnd, callback)
}


var getResults = function(sessionBegin, sessionEnd, callback) {
	
	async.waterfall([
		function(next) {
			recommender.recommend(sessionBegin, sessionEnd.length, next)		
		},
		function(recommendedItems, next) {

			var hits = measure.getHitsVs(
				sessionEnd, 
				recommendedItems, 
				baselineItems
			);

			allHits[0] += hits.hitsR // hits by recommender
			allHits[1] += hits.hitsB // hits by baseline

			var precRecom 	= hits.hitsR / sessionEnd.length
			var precPopular = hits.hitsB / sessionEnd.length

			callback(null, precRecom, precPopular)
		}
	], callback)
}






exports.start = start

start();