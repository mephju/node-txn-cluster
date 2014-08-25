var spawn = require('child_process').spawn;
var async = require('async')

 
var datasetNames = [
	'gowalla',
	'movielens_1m',
	'last_fm',
	// 'last_fm_small',
	// 'gowalla_small',
	// 'movielens_custom_large'
];


console.log('')

var recommenders = [
	'own-method',
	'most-popular-baseline',
	'apriori-baseline'
];



var main = function(recommenderType, done) {
	async.eachSeries(
		datasetNames,
		function(datasetName, next) {
			console.log('multiRun', datasetName)
			var node = spawn('node',['./index.js', datasetName, recommenderType])
			handleNode(datasetName, node, next)
		}, 
		function(err) {
			if(err) {
				console.log(err)
			}
			done(err)
		}
	);	
}



var handleNode = function(datasetName, node, done) {
	node.stdout.setEncoding('utf8');
	node.stdout.on('data', function(data) {
		console.log('\x1b[32m', datasetName, data.toString())
		//process.stdout.write('datasetName', data.toString())
	})

	node.stderr.on('data', function(data) {
		console.log('\x1b[31m', datasetName,'ERROR', data.toString().toUpperCase())
	})

	node.on('close', function(code, signal) {
		console.log(datasetName, 'close', code, signal)
		done(null)
	})
}



async.eachSeries(
	recommenders,
	function(recommenderType, next) {
		main(recommenderType, next)
	},
	function(err) {
		console.log('multiRun finished')
	}
);