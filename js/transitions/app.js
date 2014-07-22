var async 		= require('async')
var dataset 	= require('../dataset-defs').dataset()
var db			= require('./db')
var txnApp		= require('../transactions/app')
var txnDb		= require('../transactions/db')
var help 		= require('../help')
var config 		= require('../config')
var eachtick 	= require('eachtick')
var transMarkov = require('./trans-markov-chain')
var transitions = require('./transitions')

var buildTransitions = function(clusters, callback) {
	async.waterfall([
		function(next) {
			db.init(next)
		},
		function(next) {
			txnDb.getClusteredTxns(next)
		},
		function(txnRows, next) {
			//console.log('getClusteredTxns', txnRows.length, JSON.stringify(txnRows[0]))
			transitions.findTransitions(clusters, txnRows, next)
		}

	], function(err) {
		console.log('finished building transitions', err || '')
		callback(err)
	})
}


var buildMarkovChain = function(done) {
	console.log('buildMarkovChain')
	transMarkov.buildMarkovChain(done)
}



exports.buildMarkovChain = buildMarkovChain
exports.buildTransitions = buildTransitions




var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}