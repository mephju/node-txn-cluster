var sqlite3						= require('sqlite3').verbose()
var PopularityBasedRecommender 	= require('./popularity-based-recommender')




var create = function(dataset, done) {
	console.log('mostpopular.init')

	var db = new sqlite3.Database(dataset.dbPath)
	
	async.waterfall([
		function(next) {
			help.getTrainingSetSize(db, next)
		},
		function(size, next) {
			var sql = getPopularItemsSql(size)
			db.all(sql, next)
		},
		function(rows, next) {
			var items = rows.map(function(row) {
				return row['item_id']
			})
			var popularityBasedRecommender = new PopularityBasedRecommender(dataset, items)
			done(null, popularityBasedRecommender)
		}
	], done)
}



exports.create = create 

//
// get most popular items from the training set
//
var getPopularItemsSql = function(trainingSize) {
	return 'select 	item_id, 	\
				count(item_id) 	\
				as count 		\
	from 		txn_items 		\
	where 		txn_id  		\
	in 							\
	(select 	txn_id 			\
	from 		txns 			\
	order by 	txn_id			\
	limit ' + 	trainingSize +')\
	group by 	item_id			\
	order by 	count desc  	\
	limit ' 	+ config.N
}