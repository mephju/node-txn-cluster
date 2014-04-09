var sqlite3		= require('sqlite3').verbose()
var dataset		= require('../dataset-defs').dataset()
var db 			= exports.db = new sqlite3.Database(dataset.db())
var async		= require('async')
var txnDb		= require('../transactions/db')
var recommender = require('../recommend/app')
var baseline 	= require('./most-popular')
//var seqFind 	= require('../sequences/seq-find')
var config		= require('../config')
var popularItems = null



var start = function(callback) {
	async.waterfall([
		function(next) {
			baseline.recommend(300, next)
		},
		function(popular, next) {
			console.log('got %d popular items', popular.length)
			popularItems = popular
			txnDb.getTxnIdsForValidation(next)
		},
		function(txnIds, next) {
			evalOnTxns(txnIds, next)
		},
		function(rows) {
			callback(null, rows.map(function(row) {
				return row['item_id']
			}))
		}
	], 
	function(err) {
		console.log(err) 
		if(callback) { 			
			callback(err) 
		}
	})
}




var evalOnTxns = function(txnIds, callback) {
	async.eachSeries(
		txnIds,
		function(txnId, next) {
			evalOnTxn(txnId, next)
		},
		callback
	);
}


var evalOnTxn = function(txnId, callback) {
	async.waterfall([
		function(next) {
			txnDb.getTxn(txnId, next)
		},
		function(txn, next) {
			compare(txn,  next)
		}
	], callback)
}

// Prec 	= Retrieved AND Relevant / Retrieved
// Recall	= Retrieved AND Relevant / Relevant
// 
//
//

var compare = function(txn, callback) {
	var len = txn.length
	var max = txn.length - 1
	var recommendedItems = null

	var i = 1;

	async.whilst(
	    function () { return i<max; },
	    function (next) {
	        var sessionBegin 	= txn.slice(0, i)
			var sessionEnd 		= txn.slice(i, len)
	        i++;
	        getResults(sessionBegin, sessionEnd, function(err, precRecom, precPopular) {
	        	console.log('precision', precRecom, precPopular, txn.length)
	        	next(err)
	        })
	    },
	    function (err) {
	        callback(err)
	    }
	);
}


var getResults = function(sessionBegin, sessionEnd, callback) {

	var sessionEndPopular = popularItems.slice(0, sessionEnd.length)

	async.waterfall([
		function(next) {
			recommender.recommend(sessionBegin, sessionEnd.length, next)		
		},
		function(recommendedItems, next) {
			
			var hitsByRecommender = sessionEnd.filter(function(item, idx, arr) {
				return recommendedItems.indexOf(item) != -1
			})
			var hitsByBaseline = sessionEnd.filter(function(item, idx, arr) {
				return popularItems.indexOf(item) != -1
			})

			console.log('hits', hitsByRecommender.length, hitsByBaseline.length)

			var precRecom 	= hitsByRecommender.length / sessionEnd.length
			var precPopular = hitsByBaseline.length / sessionEnd.length

			callback(null, precRecom, precPopular)
		}
	], callback)
}

exports.start = start

start();