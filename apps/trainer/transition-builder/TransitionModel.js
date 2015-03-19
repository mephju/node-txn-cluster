

function TransitionModel(dataset) {
	app.Model.call(this, dataset)

	this.dataset = dataset
	log(dataset)
	this.table = {
		transitions: this.dataset.prefixTableName('transitions')
	}
}

TransitionModel.prototype = Object.create(app.Model.prototype, {
	constructor: TransitionModel
})
module.exports = exports = TransitionModel




TransitionModel.prototype.init = function(done) {

	async.wfall([
		function(next) {
			this.db.run('drop table if exists ' + this.table.transitions, next)
		},
		function(next) {
			this.db.run('create table ' + this.table.transitions + '(txn_id integer, sequence text)', next)
			
		}
	], this, done);
}

TransitionModel.prototype.insertTransitions = function(manyTransitions, done) {
	var model = this
	console.log('insertTransitions', manyTransitions.length)
	
	async.waterfall([
		function(next) {
			model.db.run('begin transaction', next)
		},
		function(next) {
			async.eachSeries(
				manyTransitions,
				function(tsns, next) {
					//console.log(tsns.txn_id, tsns.seq)
					model.db.run(
						'insert into ' + model.table.transitions + ' values($1, $2)', 
						tsns['txn_id'],
						tsns.seq.toString(), 
						next
					);
				},
				next
			);
		},
		function(next) {
			console.log('done')
			model.db.run('end transaction', done)
		}
		
	], done);
}



TransitionModel.prototype.getTransitions = function(done) {
	var model = this
	console.log('getTransitions')
	async.waterfall([
		function(next) {
			model.db.all('select * from ' + model.table.transitions, next)
		},
		function(rows, next) {
			rows.forEach(function(item, i) {
				rows[i] = item['sequence'].split(',').map(function(string) {
					return parseInt(string)
				})
			})
			done(null, rows)
		}
	], done);
}



























// TransitionModel.prototype.insertTransMatrix = function(transMatrix, callback) {

// 	console.log('insertTransMatrix', transMatrix.length)
// 	this.insertMatrix('trans_matrix', transMatrix, callback)
// }

// TransitionModel.prototype.getTransMatrix = function(callback) {
// 	var model = this
// 	console.log('getTransMatrix')
// 	async.waterfall([
// 		function(next) {
// 			model.db.all('SELECT matrix_row FROM trans_matrix ORDER BY cluster_id', next)
// 		},
// 		function(rows, next) {
// 			console.log('getTransMatrix', rows.length)
// 			var matrix = rows.map(function(row) {
// 				return JSON.parse(row['matrix_row'])
// 			})
// 			console.log('getTransMatrix', matrix)
// 			callback(null, matrix)
// 		},
// 	], callback)
// }



// TransitionModel.prototype.insertMatrix = function(tableName, matrix, callback) {
// 	var model = this
// 	console.log('insertMatrix', matrix.length)
// 	async.series([
// 		function(next) {
// 			model.db.run('DROP TABLE IF EXISTS ' + tableName, next)
// 		},
// 		function(next) {
// 			model.db.run('CREATE TABLE IF NOT EXISTS ' + tableName + '(cluster_id INTEGER, matrix_row TEXT, row_sum INTEGER);', next)
// 		},
// 		function(next) {
// 			model.db.run('BEGIN TRANSACTION;', next)
// 		},
// 		function(next) {

// 			matrix.forEach(function(matrixRow, i) {
// 				model.db.run(
// 					'INSERT INTO ' + tableName + '(cluster_id, matrix_row, row_sum) VALUES(?, ?, ?)', 
// 					[i, JSON.stringify(matrixRow), help.arraySum(matrixRow)]
// 				);
				
// 			})
// 			next(null)
// 		},
// 		function(next) {
// 			model.db.run('END TRANSACTION;', next)
// 		},
// 	], function(err) {
// 		if(err) {
// 			console.log('insertMatrix', 'error')
// 		}
// 		callback(err)
// 	})
// }