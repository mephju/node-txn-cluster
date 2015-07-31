var sqlite3						= require('sqlite3').verbose()
var PopularityBasedRecommender 	= require('./popularity-based-recommender')




var create = function(dataset, done) {
	console.log('mostpopular.init')


	var db = new sqlite3.Database(dataset.dbPath)
	var txnModel = new app.models.TxnModel(dataset)
	
	async.waterfall([
		function(next) {
			db.run(
				'create index if not exists ' + txnModel.table.txnItemGroups + '_index_txn_id on ' + txnModel.table.txnItemGroups + '(txn_id)', 
				next
			);
		},
		function(next) {
			txnModel.txnsForTraining(next)
		},
		function(txns, next) {
			db.all(
				getPopularItemsSql(txnModel.table.txnItemGroups, dataset), 
				next
			);
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


var getPopularItemsSql = function(txnItemGroupsTable, dataset) {
	log('getPopularItemsSql')
	return 'select distinct item_id from txn_item_counts as tic, ' + txnItemGroupsTable + ' as tig \
	where tic.txn_id=tig.txn_id \
	order by tic.count desc \
	limit ' + dataset.config.N

	// return 'select 	item_id, count \
	// from 		txn_item_counts		\
	// where 		txn_id in 		\
	// 	(select txn_id 			\
	// 	from ' + txnItemGroupsTable +  ') \
	// order by 	count desc  	\
	// limit ' + dataset.config.N
}