

CreateRawDataTable <- function(kDatasetName) {
	res <- read.csv(
		paste0('../', kDatasetName, '_more.csv'), 
		header=TRUE,
		strip.white=TRUE
	)
	# "xvalidation","distance","strategy","markov","precision"
	res <- data.frame(
		res$xvalidation,
		res$distance,
		res$strategy,
		res$markov,
		res$precision
	)
	names(res) <- c('xvalidation','distance','strategy','markov','precision')
	print(res)
	# res$precision = round(res$precision, digits=4)
	res$precision = formatC(res$precision, format='f', digits=4)
	res$xvalidation = mapvalues(
		res$xvalidation, 
		from=c(0,1,2), 
		to=c(1,2,3)
	)

	res$markov = mapvalues(
		res$markov, 
		from=c(1, 2, 3), 
		to=c('1st', '2nd', '3rd')
	)

	res$strategy = mapvalues(
		res$strategy, 
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', 'TF')
	)
	
	res$distance = mapvalues(
		res$distance, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)



	xvalidations = c(1,2,3)


	subframe1 <- MakeSubFrame(res, 1)
	subframe2 <- MakeSubFrame(res, 2)
	subframe3 <- MakeSubFrame(res, 3)

	# print(subframe1)
	# print(subframe2)
	# print(subframe3)
	res <- merge(subframe1, subframe2)

	res <- merge(res, subframe3)


	for(y in 1:nrow(res)) {	
		cat(paste(
			sep=' ',
			res[y,]$distance,' & ',
			res[y,]$strategy,' & ',
			res[y,]$markov,' & ',
			res[y,]$x1, ' & ',
			res[y,]$x2, ' & ',
			res[y,]$x3, '  ',
			'\\\\ \\hline\n'
		))
		
	}

	return(res)

	

} 

# Takes a frame's values which are equal to colname
# and creates a new column based on these values 
MakeSubFrame <- function(frame, colname) {
	subframe = frame[frame$xvalidation == colname,]
	names(subframe)[names(subframe) == 'precision'] <- paste0('x',colname)
	subframe <- subframe[-1]
	return(subframe)
}