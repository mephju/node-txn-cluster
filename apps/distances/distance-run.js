var TxnModel 		= require('../session-builder/transactions/model').Model
var Distance 		= require('../trainer/similarity').Distance
var DistanceModel 	= require('./distance-model')


function DistanceRun(dataset) {
	this.dataset = dataset
	this.distanceMeasure = new Distance(dataset)
	this.distanceModel = new DistanceModel(dataset)
}

exports.DistanceRun = DistanceRun

DistanceRun.prototype.run = function(done) {
	log('run')
	async.wfall([
		function(next) {
			this.distanceModel.prepare(next)
		},
		function(next) {
			new TxnModel(this.dataset).txns(next)
		},
		function(txnRows, next) { 

			this._computeDistances(txnRows, next)
		},
		function(next) {
			this.distanceModel.finish(next)
		},
	], this, done)
}




DistanceRun.prototype._computeDistances = function(txnRows, done) {
	// var include = false
	// txnRows = txnRows.filter(function(row) {
	// 	include = include || row.txn_id === 7490
	// 	return include
	// }).slice(1)

	async.eachSeries(
		txnRows, //
		function(txnRow, next) {
			
			//reduce length of txn if really long
			if(txnRow['item_ids'].length > this.dataset.config.EASY_SEQUENCE_SIZE)  {
				txnRow['item_ids'].splice(
					this.dataset.config.EASY_SEQUENCE_SIZE, 
					Number.MAX_VALUE
				);
			}

			log('next txn', txnRow.txn_id)
			var distances = this._getDistances(txnRow, txnRows)
			this.distanceModel.insert(txnRow, distances, next)
		}.bind(this),
		done
	);
}


DistanceRun.prototype._getDistances = function(txnRow, txnRows) {
	log('_getDistances')
	var distances = []



	for(var i=0, len=txnRows.length; i<len; i++) {
		var compareTxn = txnRows[i]['item_ids'] //.slice(0, 10)
		// log(txnRow.item_ids, compareTxn, this.distanceMeasure.distance(
		// 	txnRow['item_ids'], 
		// 	compareTxn
		// ))
		distances.push(parseFloat(this.distanceMeasure.distance(
			txnRow['item_ids'], 
			compareTxn
		)).toFixed(5));

		//log(distances[i])
	}

	return distances
}