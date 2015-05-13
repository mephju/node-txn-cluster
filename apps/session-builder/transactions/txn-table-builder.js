
function TxnTableBuilder(dataset, model) {
	this.dataset = dataset
	this.model = model
}

module.exports = TxnTableBuilder



TxnTableBuilder.prototype.txnItemGroups = function(numTxns, done) {
	log.yellow('txnItemGroups, for txns', numTxns)

	var bag = { numTxns: numTxns }

	var _this = this
	var validationRuns = new app.EvalConfig().xValidationRuns

	async.eachChain(
		[0,1,2], //validationRuns,
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

	var numTxns 		= params.numTxns
	var tableName 		= params.tableName
	var validationRun 	= params.validationRun
	var third 			= Math.floor(numTxns / 3)
	
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
			LIMIT ' 		+ (2 * third) + ' \
			OFFSET ' 		+ third,

			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ third
		];

		case 2: return [
			'CREATE TABLE IF NOT EXISTS	' + tableName + ' AS \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ third,

			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ third + ' \
			OFFSET ' 		+ 2 * third,
			
			'INSERT INTO ' + tableName + ' \
			SELECT 			* \
			FROM 			txn_item_groups_original \
			LIMIT ' 		+ third + ' \
			OFFSET ' 		+ third
		];
					
		default: throw new Error('there is something wrong with the validationRun variable ' + validationRun)	
	}
		
	
}