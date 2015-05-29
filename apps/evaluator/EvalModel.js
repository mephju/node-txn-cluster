
var Nedb	= require('nedb')
var clustering 	= require('../trainer/clustering')

var db = null

function EvalModel(dataset, baseline) {
	app.Model.call(this, dataset)

	this.filepath  = dataset.resultPath 
	+ 'evaluation-' + (baseline ? baseline : '') // append baseline value so we can find an evaluation result file for baselines
	+ this.dataset.name 
	+ '.db'
	
	if(!db) {
		db = new Nedb({ 
			filename: this.filepath,
			autoload: true
		});
	}
	this.db = db
}

// EvalModel.prototype = Object.create(app.EvalModel.prototype, {
// 	constructor: EvalModel
// })

module.exports = exports = EvalModel




/**
 * Store these infos:
 *  date of storage
 * 	dataset
 * 	config
 * 	number of clusters
 * 	number of clustered txns
 * 	number of training txns
 * 	number of validation txns
 * 	number of txns of training set
 * 	precision
 * 	
 * @param  {[type]}   precision [description]
 * @param  {Function} done      [description]
 * @return {[type]}             [description]
 */
EvalModel.prototype.insert = function(precision, done) {
	log.blue('EvalModel.insert')
	var config = this.dataset.config
	var dataset =  _.clone(this.dataset)
	
	delete dataset.config

	var txnModel = new app.models.TxnModel(this.dataset)

	var result = {
		createdAt: new Date(),
		dataset: dataset,
		config: config,
		precision: precision,
	}

	async.wfall([
		function(next) {
			log.blue('insert step', 1)
			txnModel.getClusteredTxns(next)
		},
		function(txns, next) {
			log.blue('insert step', 2)
			result.clusteredTxns = txns.length
			clustering.buildClustersFromDb(this.dataset, next)
		},
		function(clusters, next) {
			log.blue('insert step', 3)
			result.numClusters = clusters.clusters.length
			help.getTrainingSetSize(this.dataset, txnModel.db, next)
		},
		function(size, next) {
			log.blue('insert step', 4)
			result.numTxnsTraining = size
			txnModel.txnsForValidation(next) 
		},
		function(txns, next) {

			log.blue('insert step', 5)
			result.numTxnsValidation = txns.length
			txnModel.txns(next)
		},
		function(txns, next) {
			log.blue('insert step', 6)
			result.numTxns = txns.length
			log.yellow((result))
			this.db.insert(result, function(err, newDoc) {
				log(err, newDoc)
				done(err)
			})
		}
	], this, done)

	
}