var sqlite3		= require('sqlite3').verbose()
var util		= require('util')
var async		= require('async')
var sql 		= require('./sql')
var seqCount	= require('./seq-count')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var config		= require('../config')

exports.db = db



exports.init = function(dataset, callback) {

	var table = dataset.dbTable

	async.waterfall([
		function(next) {
			db.serialize(next)
		},
		function(next) {
			db.run(sql.sequences.makeDropStmt(), next)
		},
		function(next) {
			db.run(sql.sequences.makeCreateStmt(), next)	
		}
	],
	callback)
}



// store counts of each sequence
// store txns as a set of sequences
exports.store = function(txnSeqStore, dataset, callback) {

	console.log('seqstore.store', dataset.dbTable)

	async.waterfall([
		function(next) {
			db.run('BEGIN TRANSACTION', next)
		},
		function(next) {
			var counts 	= new seqCount.SeqCounter().count(txnSeqStore)
			next(null, counts)
		},
		function(seqCounts, next) {
			storeCounts(seqCounts, next)
		},
		function(next) {
			db.run('END TRANSACTION', next)
		}
	],
	function(err) {
		console.log('finished store', err)
		callback(err)
	})
}






var storeCounts = function(seqCounts, callback) {
	var sequences = Object.keys(seqCounts)

	console.log('inserting counts of %d seqs', sequences.length)

	var insertStmt = sql.sequences.makeInsertStmt()
	var updateStmt = sql.sequences.makeUpdateStmt()

	async.eachSeries(
		sequences,
		function(seq, next) {

			var params = {
				sequenceString: seq.toString(),
				count: 			seqCounts[seq.toString()],
				insertStmt: 	insertStmt,
				updateStmt: 	updateStmt
			}
			
			insertSeqCount(params, next)
		},
		function(err) {
			console.log('inserted')
			callback(err)
		}
		
	);
}


var insertSeqCount = function(params, callback) {
	async.waterfall([
		function(next) {
			db.run(params.updateStmt, params.count, params.sequenceString, function(err) {
				next(err, this.changes)
			})
		},
		function(changes, next) {
			if(changes === 0) {
				db.run(params.insertStmt, params.sequenceString, function(err1) {
					db.run(params.updateStmt, params.count, params.sequenceString, function(err2) {
						next(err1 || err2, changes)
					})			
				})	
			} else {
				next(null)
			}
			
		},
		function(changes, next) {
			next(null)
		}
		
	], function(err) {
		err && console.log(err)
		callback(err)
	})
}



var createFreqSeqView = function(dataset, callback) {
	var stmt = sql.sequences.createFrequentSequencesStmt(config.MIN_SEQUENCE_FREQUENCY);
	console.log('createFreqSeqView', stmt)

	db.run(
		stmt, 
		callback
	);
}

var getFreqSeqs = function(callback) {
	db.all(
		sql.sequences.getFrequent(),
		function(err, rows) {
			rows = rows || []
			var freqSeqs = rows.map(function(row) {

				return row.sequence
			})
			console.log('getFreqSeqs.num', freqSeqs.length)
			callback(err, freqSeqs)
		}
	);
}

exports.getFreqSeqs = getFreqSeqs
exports.createFreqSeqView = createFreqSeqView




