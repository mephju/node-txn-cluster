var datasetDefs 	= require('../dataset-defs')
var dataset 		= datasetDefs.dataset()
var async			= require('async')
var txnApp			= require('../transactions/app')
var simMatrixDb 	= require('./sim-matrix-db')

var sim				= require('./sim')


//Build similarity matrix by building it from the txns
//Matrix(txnRows) 
//
//Build matrix from the db matrix rows
//Matrix(txnRws, matrixSimRows) 
var Matrix = function(txnRows, matrixSimRows) {
	this.matrix = []
	this.txnRows = txnRows
	this.txnIdStore = {}


	if(matrixSimRows) {
		this.rebuildMatrix(matrixSimRows)
	} else {
		this.buildMatrix()	
	}
}

Matrix.prototype.rebuildMatrix = function(matrixSimRows) {
	var len = matrixSimRows.length
	for (var i = 0; i < len; i++) {

		this.matrix[i] = matrixSimRows[i].similarities.split(',').map(function(textNum) {
			return parseFloat(textNum)
		})	
	}
}

Matrix.prototype.buildMatrix = function() {
	var txnRows = this.txnRows
	var len = txnRows.length
	
	for(var i=0; i<len; i++) {
		this.matrix[i] = []
		this.txnIdStore[txnRows[i]['txn_id']] = i
	}
	
	for(var i=0; i<len; i++) {
		
		console.log(txnRows[i]['txn_id'])

		for(var j=i+1; j<len; j++) {

			
			if(i !== j) {
				this.matrix[i][j] = sim.calcSim(
					txnRows[i]['item_ids'], 
					txnRows[j]['item_ids']
				);	
			}

			// this.matrix[i][j] = similarity
			//this.matrix[j][i] = similarity
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
	var index = this.txnIdStore[txnId]
	var row = this.matrix[index]
	return row
}

Matrix.prototype.getSim = function(txnIdA, txnIdB) {
	var indexA = this.txnIdStore[txnIdA]
	var indexB = this.txnIdStore[txnIdB]
	// console.log('getsim', txnIdA, txnIdB)
	// console.log('getsim', indexA, indexB)
	// console.log('getsim', this.matrix[indexA])
	// console.log('getsim', this.matrix[indexB])

	if(indexA === indexB) {
		return 1
	} 
	else if(indexA > indexB) {
		return this.matrix[indexB][indexA]
	}
	return this.matrix[indexA][indexB]
}






var buildMatrixFromTxns = function(txnRows) {
	console.log('buildMatrix', 'have %d txns', txnRows.length)
	var matrix = new Matrix(txnRows)
	return matrix
}




var buildMatrixFromDb = function(done) {
	console.log('buildMatrixFromDb')
	async.waterfall([
		function(next) {
			simMatrixDb.getSimMatrix(next)
		},
		function(txnRows, matrixSimRows) {
			var matrix = new Matrix(txnRows, matrixSimRows)
			done(null, matrix)
		}
	], done)
}






exports.Matrix = Matrix
exports.buildMatrixFromDb = buildMatrixFromDb
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