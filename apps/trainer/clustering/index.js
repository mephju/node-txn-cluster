
var TxnModel 		= require('../../session-builder/transactions/model').Model
var clustering		= require('./clustering')
var ClusterModel	= require('./model').Model




exports.buildClustersFromDb = function(dataset, done) {
	new ClusterModel(dataset).buildClustersFromDb(done)
}

exports.buildClusters = function(dataset, done) {
	log('buildClusters')
	var txnRows 		= null
	var clusterModel 	= new ClusterModel(dataset)
	var txnModel 		= new TxnModel(dataset)
	var clusters 		= null
	

	async.waterfall([
		function(next) {
			txnModel.txnsForTraining(next)
		},
		function(rows, next) {
			console.log('clustering %d txns', rows.length)
			txnRows = rows
			next(null)
		},
		function(next) {
			clustering.cluster(dataset, txnRows, next)
		},
		function(_clusters, next) {
			clusters = _clusters
			log.yellow(clusters)
			clusterModel.insertClusters(clusters, next)
		},
		function(next) {
			_buildClusterTables(clusterModel, next)
		} 
		
	], function(err) {
		done(err, clusters)
	})
}


var _buildClusterTables = function(clusterModel, done) {
	async.waterfall([
		function(next) {
			clusterModel.tableClusterItemCounts(next)
		},
		function(next) { // correct
			clusterModel.tableTxnItemRatings(next)
		},
		function(next) {
			clusterModel.tableClusterItemRatings(next)
		},
		function(next) {
			clusterModel.tableItemClusterCounts(done)
		}
	], done)
}

