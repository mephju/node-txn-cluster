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
var Simtrix = function(txnRows) {
	this.txnRows = txnRows
	this.matrix = this.buildMatrix(this.txnRows)	
}




Simtrix.prototype.buildMatrix = function(txnRows) {
	var matrix = []
	var len = txnRows.length
	
	//fill top right half of matrix
	for(var i=0; i<len; i++) {
		
		matrix[i] = []
		matrix[i][i] = 1
		
		for(var j=i+1; j<len; j++) {
			
			matrix[i][j] = sim.calcSim(
				txnRows[i]['item_ids'], 
				txnRows[j]['item_ids']
			);				
		}
	}

	//copy top right half into bottom left half
	for(var i=0; i<len; i++) {
		for(var j=i-1; j>=0; j--) {
			matrix[i][j] = matrix[j][i]				
		}
	}

	return matrix
}



exports.Simtrix = Simtrix


var file 	= process.argv[1]
var method 	= process.argv[2]
// was this file was started from the command line?
// if so, call entry level method
if(file === __filename) { 
	if(method) {
		exports[method]()
	}
}