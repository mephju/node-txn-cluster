var sqlite3		= require('sqlite3').verbose()
var util		= require('util')
var async		= require('async')
var sql 		= require('./sql')
var seqCount	= require('./seq-count')
var dataset 	= require('../dataset-defs').dataset()
var db 			= new sqlite3.Database(dataset.db())
var config		= require('../config')
var help		= require('../clustering/help')
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
			var seqCounts = new seqCount.SeqCounter().count(txnSeqStore)
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
					var numComponents = seqCounts[sequence].components
					//console.log(numComponents)
					insertStmt.run( sequence, numComponents, next)		
				},
				next
			);
		},
		function(next) {
			console.log('storeCount: counts')
			async.eachSeries(
				sequences,
				function(sequence, next) {
					var count = seqCounts[sequence].count
					updateStmt.run(count, sequence, next)
				},
				next
			);
		}
	], function(err) {
		console.log('inserted counts of batch', err)
		callback(err)
	})
}




var createFrequentSequences = function(callback) {
	async.waterfall([
		function(next) {
			db.run('DROP TABLE IF EXISTS frequent_sequences', next)
		},
		function(next) {
			db.run('CREATE TABLE IF NOT EXISTS frequent_sequences(sequence TEXT)', next)
		},
		function(next) {
			getFreqSeqsUnfiltered(next)
		},
		function(freqSeqs, next) {
			var filteredFreqSeqs = filterSequences(freqSeqs)
			insertFrequentSeqs(filteredFreqSeqs, next)
		}
	], callback)
}


//
//Only keep sequences which are not contained within other frequent sequences
//
var filterSequences = function(sequences) {
	var filtered = []
	var len = sequences.length
	var s = sequences

	for(var i=0; i<len; i++) {
		var include = true
		
		for(var h=0; h<len; h++) {
			var intersect = help.intersect(s[i], s[h])
			//console.log('i %d --- h %d === intersection %d', i, h, intersect.length)	
			if(i !== h && intersect.length === s[i].length) {

				include = false
				break;
				// h = 0;
				// i = i < len-1 ? i+1 : i; //increase i if not exceeds length
			}
		}	
		
		if(include) {
			filtered.push(s[i])
		}
	}
	return filtered;
}

var insertFrequentSeqs = function(sequences, callback) {
	console.log('insertFrequentSeqs', sequences.length)
	db.run('BEGIN TRANSACTION')
	
	async.eachSeries(
		sequences,
		function(sequence, next) {
			db.run('INSERT INTO frequent_sequences(sequence) VALUES(?)', sequence.toString(), next)
		},
		function(err) {
			db.run('END TRANSACTION', callback)
		}
	);
}




var getFreqSeqs = function(callback) {
	getFrequentHelp('SELECT sequence FROM frequent_sequences', callback)
}

//callback(err [,freqSeqs])
var getFreqSeqsUnfiltered = function(callback) {
	getFrequentHelp(sql.sequences.getFrequent(), callback)
}

var getFrequentHelp = function(stmt, callback) {
	db.all(
		stmt,
		function(err, rows) {
			console.log('getFrequentHelp.rows', rows.length, err)
			rows = rows || []
			var freqSeqs = rows.map(function(row) {
				return row.sequence.split(',').map(function(numstring) {
					return parseInt(numstring)
				})
			})
			console.log('getFrequentHelp.num', freqSeqs.length)
			callback(err, freqSeqs)
		}
	);
}



// getFreqSeqs(function(err, frequents) {
// 	console.log('f', frequents)
// })

exports.getFreqSeqs = getFreqSeqs
exports.createFrequentSequences = createFrequentSequences



//console.log(filterSequences([[5], [5,1],[1,2,3],[1],[1,2]]))