var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async			= require('async')
var txnDb 			= require('../transactions/db')
var simMatrix		= require('./sim-matrix')
var clustering		= require('./clustering')
var clusterDb		= require('./db')


var start = function(done) {
	var txnRows = null
	var matrix = null

	async.waterfall([
		function(next) {
			txnDb.getAllTxns(next)
		},
		function(rows, next) {
			console.log('clustering %d txns', rows.length)
			txnRows = rows
			simMatrix.buildMatrixFromTxns(txnRows, next)	
		},
		function(matrixxx, next) {
			matrix = matrixxx
			clustering.cluster(txnRows, matrix, next)
		},
		function(clusters, next) {
			// clusters.clusters.forEach(function(cluster) {
			// 	console.log('cluster', cluster.centroidRow)
			// 	console.log('members', cluster.members)
			// 	console.log('####################')
			// })
			clusterDb.insertClusters(clusters, next)
		}
	], function(err) {
		console.log('finished clustering', err)
		if(done) { done(err) }
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