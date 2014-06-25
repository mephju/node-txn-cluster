var fs 				= require('fs')
var readline 	= require('readline');
var Stream 		= require('stream')
var db				= require('./db')




exports.read = function(datasetInfo) {
	var instream = fs.createReadStream(datasetInfo.path)	
	
	var rl = readline.createInterface({
	  input: instream,
	  terminal: false
	});

	var insertCount = 0;
	var lineCount = 0
	var records = []





	rl.on('resume', function() { 
		console.log('onresume ' + lineCount++)
	})



	rl.on('pause', function() { 
		console.log('onPause ' + lineCount)
		if(lineCount == 5) {
			setTimeout(function() {
				rl.resume()
			}, 5000)
		} else {
			rl.resume()
		}		
	})


	rl.on('line', function(line) {
		console.log('line ' + lineCount)
	    //console.log('line ' + line)
	    
	    line = line.split(datasetInfo.separator)
	    
	    var record = [
	    	line[datasetInfo.userIdx], 
	    	line[datasetInfo.itemIdx], 
	    	line[datasetInfo.timestamp]
	    ]
	    records.push(record)


	    rl.pause()

	    
	});



	rl.on('close', function(){
		console.log('onClose ' + lineCount)

	})
}



