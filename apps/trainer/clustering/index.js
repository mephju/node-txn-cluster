
var TxnModel 		= require('../../session-builder/transactions/model').Model
var clustering		= require('./clustering-old')
var ClusterModel	= require('./model').Model



exports.buildClustersFromDb = function(dataset, done) {
	new ClusterModel(dataset).buildClustersFromDb(done)
}

exports.buildClusters = function(dataset, done) {
	var txnRows 		= null
	var clusterModel 	= new ClusterModel(dataset)
	var txnModel 		= new TxnModel(dataset)
	var clusters 		= null
	async.waterfall([
		function(next) {
			txnModel.getTxnsForTraining(next)
		},
		function(rows, next) {
			console.log('clustering %d txns', rows.length)
			txnRows = rows
			next(null)
		},
		function(next) {
			clustering.cluster(txnRows, next)
		},
		function(_clusters, next) {
			clusters = _clusters
			log.yellow(clusters)
			clusterModel.insertClusters(clusters, next)
		},
		function(next) {
			clusterModel.tableClusterItemCounts(next)
		},
		function(next) { // correct
			clusterModel.tableTxnItemRatings(next)
		},
		function(next) {
			log('2nd')
			clusterModel.tableClusterItemRatings(next)
		},
		function(next) {
			clusterModel.tableItemClusterCounts(next)
		}
	], function(err) {
		done(err, clusters)
	})
}


var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}