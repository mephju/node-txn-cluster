var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async			= require('async')
var txnApp			= require('../transactions/app')

var sim				= require('./sim')



var Matrix = function(txnRows) {
	this.matrix = []
	this.txnRows = txnRows
	
	this.txnIdStore = {}
	this.buildMatrix()
}

Matrix.prototype.buildMatrix = function() {
	var txnRows = this.txnRows
	var len = txnRows.length
	
	for(var i=0; i<len; i++) {
		this.matrix[i] = []
		this.txnIdStore[txnRows[i]['txn_id'].toString()] = i
	}
	
	for(var i=0; i<len; i++) {
		
		console.log(txnRows[i]['txn_id'])
		for(var j=i; j<len; j++) {

			var similarity = 0
			if(i === j) {
				similarity = 1
			} else {
				similarity = sim.calcSim(
					txnRows[i]['item_ids'], 
					txnRows[j]['item_ids']
				);	
			}

			this.matrix[i][j] = {
				sim: similarity,
				txnId: txnRows[j]['txn_id']
			}
			this.matrix[j][i] = {
				sim: similarity,
				txnId: txnRows[i]['txn_id']
			}
		}
	}
	//console.log(JSON.stringify(matrix))
	return this.matrix
}

Matrix.prototype.getTxnRows = function() {
	return this.txnRows
}



// Returns the matching row of similarities for a given txn id.
// 
Matrix.prototype.getRowForTxnId = function(txnId) {
	var index = this.txnIdStore[txnId.toString()]
	var row = this.matrix[index]
	return row
}

Matrix.prototype.getSim = function(txnIdA, txnIdB) {
	var indexA = this.txnIdStore[txnIdA.toString()]
	var indexB = this.txnIdStore[txnIdB.toString()]
	return this.matrix[indexA][indexB].sim
}






var buildMatrixFromTxns = function(txnRows, done) {
	async.waterfall([
		function(next) {
			console.log('buildMatrix', 'have %d txns', txnRows.length)
			var matrix = new Matrix(txnRows)
			done(null, matrix)
		}
	], done)
}









exports.buildMatrixFromTxns = buildMatrixFromTxns












var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}