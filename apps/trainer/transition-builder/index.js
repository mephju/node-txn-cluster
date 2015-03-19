var TxnModel			= require('../../session-builder/transactions/model').Model
var TransitionModel		= require('./TransitionModel')

var MarkovChain = require('./markov-chain').MarkovChain
var transitions = require('./transitions')


exports.buildTransitions = function(dataset, clusters, done) {
	
	log('buildTransitions', dataset.name)
	var transModel 	= new TransitionModel(dataset)
	var txnModel 	= new TxnModel(dataset)

	async.waterfall([
		function(next) {		
			transModel.init(next)
		},
		function(next) {
			txnModel.getClusteredTxns(next)
		},
		function(txnRows, next) {
			log.yellow('getClusteredTxns', txnRows.length)
			transitions.findTransitions(transModel, clusters, txnRows, next)
		},
		function(next) {
			new MarkovChain(dataset, transModel).build(next)
		},
		function(next) {
			done()
		}

	], function(err) {
		log.yellow('finished building transitions', err || '')
		done(err)
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