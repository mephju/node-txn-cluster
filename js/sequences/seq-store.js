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

	var insertStmt = db.prepare(sql.sequences.makeInsertStmt())
	var updateStmt = db.prepare(sql.sequences.makeUpdateStmt())

	async.waterfall([
		function(next) {
			console.log('storeCount: sequences')
			async.eachSeries(
				sequences,
				function(sequence, next) {
					insertStmt.run( sequence, next)		
				},
				next
			);
		},
		function(next) {
			console.log('storeCount: counts')
			async.eachSeries(
				sequences,
				function(sequence, next) {
					var count = seqCounts[sequence]
					updateStmt.run(count, sequence, next)
				},
				next
			);
		}
	], callback)
}




var createFreqSeqView = function(dataset, callback) {
	var stmt = sql.sequences.createFrequentSequencesStmt(config.MIN_SEQUENCE_FREQUENCY);
	console.log('createFreqSeqView', stmt)

	db.run(
		stmt, 
		callback
	);
}



//callback(err [,freqSeqs])
var getFreqSeqs = function(callback) {
	db.all(
		sql.sequences.getFrequent(),
		function(err, rows) {
			rows = rows || []
			var freqSeqs = rows.map(function(row) {
				return row.sequence.split(',').map(function(numstring) {
					return parseInt(numstring)
				})
			})
			
			console.log('getFreqSeqs.num', freqSeqs.length)
			callback(err, freqSeqs)
		}
	);
}



// getFreqSeqs(function(err, frequents) {
// 	console.log('f', frequents)
// })

exports.getFreqSeqs = getFreqSeqs
exports.createFreqSeqView = createFreqSeqView




