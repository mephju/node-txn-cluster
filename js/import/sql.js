exports.createFeedbackStmt = function() {
	return 'CREATE TABLE IF NOT EXISTS feedback (' + 
		'user_id 		INTEGER NOT NULL, ' + 
		'item_id 		INTEGER NOT NULL, ' +
		'timestamp 		TIMESTAMP NOT NULL, \
		rating  		INTEGER)' 
}