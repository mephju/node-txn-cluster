var initTransMatrix = function() {
	var size = 10
	
	var row = new Array()
	
	for(var i=0; i<size; i++) { row[i] = 0 }
	
	return row.map(function(entry) {
		return row
	})
	
}

//console.log([1,2,3].map(function(num) {return 'x'}))
console.log(initTransMatrix())