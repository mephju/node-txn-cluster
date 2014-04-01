var fs 				= require('fs')
var readline 	= require('readline');
var Stream 		= require('stream')
var db				= require('./db')


var outstream = new Stream()
outstream.writable = true
outstream.readable = true




exports.read = function(datasetInfo) {
	var instream = fs.createReadStream(datasetInfo.path)	
	var rl = readline.createInterface({
	  input: instream,
	  output: outstream
	});

	var insertCount = 0;
	var lineCount = 0
	var records = []




	var insertBatch = function(records, callback) {
		db.insert(datasetInfo.name, records, function(err) {

  			insertCount++

			if(err) { console.log('error on insert ' + err) } 
			else {		console.log('inserted batch ' + insertCount) }
			
			records = []
			
			callback()
			
    	})
	}

	rl.on('resume', function() { console.log('resuming to read from dataset')})
	rl.on('pause', function() { 
		console.log('onPause')
	})

	rl.on('line', function(line) {
			console.log('line ' + lineCount++)
	    rl.pause()
	    //console.log('line ' + line)
	    
	    line = line.split(datasetInfo.separator)
	    
	    var record = [
	    	line[datasetInfo.userIdx], 
	    	line[datasetInfo.itemIdx], 
	    	line[datasetInfo.timestamp]
	    ]

	    records.push(record)


			insertBatch(records, function() { 
				rl.resume() 
			})

		    
	});

	rl.on('close', function(){
		console.log('onClose')
		insertBatch(records, function() {
			console.log('done reading dataset ' + datasetInfo.name)	
		})
	})
}



