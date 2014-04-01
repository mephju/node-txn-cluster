var lev = require('fast-levenshtein');

console.log( 
	lev.get('hello', 'aaaaa')
);

console.log( 
	lev.get([1,2,3], [1])
);