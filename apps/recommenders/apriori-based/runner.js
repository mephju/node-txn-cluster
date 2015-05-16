require('../../init')
var fs = require('fs')

process.on('message', function(data) {
	var dataset = app.datasets.Dataset.rebuild(data)
	train(dataset)
})

var train = function(dataset) {
	
	async.waterfall([
		function(next) {
			new app.models.TxnModel(dataset).txnsForTraining(next)
		},
		function(txns, next) {
			var Apriori = require('./Apriori')
			var apriori = new Apriori(dataset)
			var rules = apriori.algorithm(txns)

			fs.writeFile(
				apriori.filename, 
				JSON.stringify(rules), 
				next
			);
		},
		function(next) {
			process.send({})
		}
	])
}