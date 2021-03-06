require('../init')

var transitions = require('./transitions')
var clustering = require('../trainer/clustering')


process.on('message', function(data) {
	async.waterfall([
		function(next) {
			log.blue(data)
			var dataset = app.datasets.Dataset.rebuild(data)

			buildTransitions(dataset, next)
		},
		function(transitions, next) {
			process.send(transitions)
		}
	])
})


var buildTransitions = function(dataset, done) {
	
	log('buildTransitions')
	
	var bag = {}


	async.waterfall([
		function(next) {
			new app.models.TxnModel(dataset).getClusteredTxns(next)
		},
		function(txnRows, next) {
			log.red('got txns', txnRows.length)
			var txnRows = txnRows.filter(function(row) {
				return row['item_ids'].length > 8 && row['item_ids'].length < 25 
			})

			var txnRows = txnRows.filter(function(row) {
				return Math.random() > 0.6;
			})			
			
			log.red('got txns after', txnRows.length)
			bag.txnRows = txnRows
			
			clustering.buildClustersFromDb(dataset, next)
		},
		function(clusters, next) {
			transitions.findTransitions(clusters, bag.txnRows, next)
		},
		function(transitions) {
			done(null, transitions)
		}
	], 
	function(err) {
		log.yellow('finished building transitions', err || '')
	});
}