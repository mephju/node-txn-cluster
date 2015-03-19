
function TxnTableBuilder(model) {
	this.model = model
}

module.exports = TxnTableBuilder



TxnTableBuilder.prototype.txnItemGroups = function(quarter, done) {
	log.yellow('txnItemGroups, quarter is', quarter)

	var bag = {
		quarter: quarter,
	}

	var _this = this

	async.eachChain(
		[0, 1, 2, 3],
		function(validationRun, next) {
			bag.validationRun = validationRun
			bag.tableName = _this.model.prefixTableName(validationRun, 'txn_item_groups')
			_this.model.db.run('DROP TABLE IF EXISTS ' + bag.tableName, next)
		},
		function(next) {
			var commands = _this.buildSql(bag)
			_this.performSql(commands, next)
		},
		done
	);
}


TxnTableBuilder.prototype.performSql = function(commands, done) {
	var _this = this
	async.eachChain(
		commands,
		function(command, next) {
			_this.model.db.run(command, next)
		},
		done
	);
}

TxnTableBuilder.prototype.buildSql = function(params) {

	var quarter 		= params.quarter
	var tableName 		= params.tableName
	var validationRun 	= params.validationRun
	
	switch(validationRun) {
		case 0: return [
			'CREATE TABLE IF NOT EXISTS	' + tableName + ' AS \
			SELECT 			* \
			FROM 			txn_item_groups_original'
		];
		
		case 1: 

		return [
			'CREATE TABLE IF NOT EXISTS	' + tableName + ' AS \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ (2 * quarter),

			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ quarter + ' \
			OFFSET ' 		+ (3 * quarter),

			'INSERT INTO ' + tableName + ' \
			SELECT 		* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ quarter + ' \
			OFFSET ' 		+ 2 * quarter
		];

		case 2: return [
			'CREATE TABLE IF NOT EXISTS	' + tableName + ' AS \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ quarter,

			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ 2 * quarter + ' \
			OFFSET ' 		+ 2 * quarter,
			
			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ quarter + ' \
			OFFSET ' 		+ quarter
		];
					

		case 3: return [
			'CREATE TABLE IF NOT EXISTS	' + tableName + ' AS \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ 3 * quarter + ' \
			OFFSET ' 		+ quarter,
			
			'INSERT INTO ' + tableName + '  \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ quarter
		];
		default: throw new Error('there is something wrong with the validationRun variable ' + validationRun)	
	}
		
	
}