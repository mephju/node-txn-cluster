require('../../init')
var Clustering		= require('./ClusteringFixed')


process.on('message', function(data) {
	log.blue('ClusterRun got message', data)
	
	var dataset = null
	
	if(data.dataset.name.indexOf('movielens') !== -1) {
		dataset = new app.datasets.Movielens(
			data.dataset.filepath,
			data.dataset.name
		);
	} 
	else if(data.dataset.name.indexOf('last') !== -1) {
		dataset = new app.datasets.LastFm(
			data.dataset.filepath,
			data.dataset.name
		);
	} 
	else if(data.dataset.name.indexOf('gowalla') !== -1) {
		dataset = new app.datasets.Gowalla(
			data.dataset.filepath,
			data.dataset.name
		);
	}

	dataset.config = new app.Config(data.dataset.config.configOptions)

	async.waterfall([
		function(next) {
			new Clustering(dataset).cluster(next)
		},
		function(clusters, next) {
			//delete everything non-essential before sending it through the pipe.
			//will not throw 'circular structure error'
			clusters.clusters.forEach(function(cluster) {
				for(var key in cluster) {
					if(key !== 'centroidRow' && key !== 'members') {
						delete cluster[key]
					}
				}
			})
			process.send(clusters)
		}
	], 
	function(err) {
		log.red(err)
	})
	
})