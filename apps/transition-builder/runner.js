require('../init')

var transitions = require('./transitions')
var clustering = require('../trainer/clustering')


process.on('message', function(data) {
	async.waterfall([
		function(next) {
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
			new app.models.TxnModel(bag.dataset).getClusteredTxns(next)
		},
		function(txnRows, next) {
			bag.txnRows = txnRows
			clustering.buildClustersFromDb(bag.dataset, next)
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