

var Clustering		= require('./ClusteringFixed')
var ClusterModel	= require('./model')
var cp = require('child_process')

exports.buildClustersFromDb = function(dataset, done) {
	log('buildClustersFromDb', dataset.name)
	new ClusterModel(dataset).buildClustersFromDb(done)
}



var q = async.queue(function(task, done) {
	var clusterModel = new ClusterModel(task.dataset)
	async.waterfall([
		function(next) {
			clusterModel.insertClusters(task.clusters, next)
		},
		function(next) {
			
			_buildClusterTables(clusterModel, next)
		}
	], 
	function(err) {
		if(err) log.red(err)
		done(err)	
	})
}, 1)

exports.buildClustersParallel = function(datasets, done) {

	async.eachLimit(
		datasets,
		app.config.USE_CORES,
		function(dataset, next) {
			startClusterRun(dataset, next)
		},
		done
	);
}

var startClusterRun = function(dataset, done) {
	
	var child = cp.fork(__dirname + '/ClusterRun.js')
	var clusters = null

	child.send({
		dataset: dataset,
	})

	child
	.on('message', function(clusters) {
		log.cyan('parent has received message')
		child.disconnect()
		q.push({
			dataset: dataset,
			clusters:clusters
		}, done)
		
	})
	.on('exit', function(code, string) {
		log.cyan('PARENT GOT EXIT EVENT')
		log('exit', code, string)
		if(code === null) {
			return done('child excited unnormally')
		}	
	})
	.on('error', function() {
		log.red('PARENT GOT ERROR EVENT')
	})
	.on('close', function() {
		log.cyan('PARENT GOT CLOSE EVENT')
	})
}





exports.buildClusters = function(dataset, done) {
	log('buildClusters')
	var clusterModel 	= new ClusterModel(dataset)
	var clusters 		= null
	

	async.waterfall([
		function(next) {
			console.log('clustering')
			new Clustering(dataset).cluster(next)
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
	log('_buildClusterTables')
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
			clusterModel.tableItemClusterCounts(next)
		},
		function(next) {
			clusterModel.tableClusterItemTfidf(next)
		},
		function(next) {
			clusterModel.createIndices(next)
		},
		function(next) {
			log.green('all cluster tables built')
			next()
		}

	], done)
}

