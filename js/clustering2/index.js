var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async			= require('async')
var txnDb 			= require('../transactions/db')
var simMatrix		= require('./sim-matrix')
var clustering		= require('./clustering')
var db				= require('./db')
var simMatrixDb		= require('./sim-matrix-db')


var start = function(callback) {
	var txnRows = null
	var matrix = null
	var clusterGroup = null

	async.waterfall([
		function(next) {
			txnDb.getAllTxns(next)
		},
		function(rows, next) {
			console.log('clustering %d txns', rows.length)
			txnRows = rows
			matrix 	= simMatrix.buildMatrixFromTxns(txnRows)	
			simMatrixDb.insertSimMatrix(matrix, next)
		},
		function(next) {
			clustering.cluster(txnRows, matrix, next)
		},
		function(clusters, next) {
			clusterGroup = clusters
			db.insertClusters(clusters, next)
		}
	], function(err) {
		
		if(callback) { callback(err, clusterGroup) }
	})
}
	

exports.start = start


var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}