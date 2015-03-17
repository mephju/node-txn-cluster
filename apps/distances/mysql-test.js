

/**
 * we need to create a store of all distances for all combinations
 * of distance measures and datasets.
 *
 * Distance measures:
 * 	levenshtein
 * 	jaccard
 * 	jaccard-levenshtein
 * 	jaccard-bigram
 *
 *
 * CREATE TABLE `distances`.`new_table` (
  `txn_id` INT NULL,
  `distances` LONGTEXT NOT NULL,
  PRIMARY KEY (`txn_id`));
 * 	
 */
var mysql      = require('mysql')

require('../init')


var db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'love5lin6',
	database: 'distances'
});

async.waterfall([
	function(next) {
		db.connect(next) 
	},
	function(info, next) {
		// return db.query('select * from distances.distances LIMIT 1', function(err, rows, next) {
		// 	var a = rows[0].distances.toString('utf8').split(',')

		// 	log('result', a.length, a[4000])
		// })
		console.log('create table')
		db.query('DROP TABLE IF EXISTS distances.distances', next)
	},
	function(info, fields, next) {
		db.query('CREATE TABLE IF NOT EXISTS distances.distances (txn_id MEDIUMINT(6) NOT NULL, distances MEDIUMBLOB NOT NULL);', next)
	},
	function(info, hmm, next) {
		console.log('table created')
		db.query('SET autocommit=0', next)
	},
	function(info, fields, next) {
		insert(next)
	},
	function(next) {
		db.query('COMMIT', next)
	},
	function(info, fields, next) {
		db.query('ALTER TABLE distances.distances ADD PRIMARY KEY(txn_id)', next)
	}
], function(err) {
	console.log('inserted', err)
})


var insert = function(done) {
	var a = []
	for(var i=1; i<70000; i++) {
		a.push(parseFloat(1/i).toFixed(8))
	}


	async.forloop(
		100,
		function(n, max, next) {
			console.log(n)
			db.query('INSERT INTO distances.distances VALUES(?, ?)', [n,a.toString()], next)
		},
		function(err) {
			done(err)
		}
	)
} 
