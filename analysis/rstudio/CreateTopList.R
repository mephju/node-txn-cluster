

CreateMethodResults <- function(kDatasetName) {
	eval <- read.csv(
		paste0('../', kDatasetName, '_more.csv'),
		header=TRUE,
		strip.white=TRUE
	)


	res <- data.frame(
		eval$distance,
		eval$xvalidation,
		eval$markov,
		eval$strategy,
		eval$precision
	)
	names(res) <- c('distance', 'xvalidation', 'markov', 'strategy', 'precision')

	res <- aggregate(
		res$precision,
		by=list(
			distance=eval$distance, 
			markov=eval$markov, 
			strategy=eval$strategy
		),
		FUN=mean
	)

	names(res)[names(res) == 'x'] <- 'precision'

	res$strategy = mapvalues(
		res$strategy, 
		from=c('random', 'tfTfidf', 'tfidf', 'bestItemsOverall', 'bestItemsOfCluster'), 
		to=c('Random', 'TF-TF-IDF', 'TF-IDF', 'Most Popular', 'Most Frequent')
	)
	
	res$distance = mapvalues(
		res$distance, 
		from=c('jaccard', 'jaccard-bigram', 'jaccard-levenshtein', 'levenshtein'), 
		to=c('Jaccard', 'Jaccard Bigram', ' Jaccard Levenshtein', 'Levenshtein')
	)

	res <- res[order(-res$precision),]

	#res$precision = round(res$precision, digits=4)
	res <- res[1:10,]
	
	return(res)
} 



CreateBaselineResults <- function(kDatasetName) {
	eval <- read.csv(
		paste0('../', kDatasetName, '_baseline_more.csv'),
		header=TRUE,
		strip.white=TRUE
	)

	# print(eval)

	res <- aggregate(
		eval$precision,
		by=list(baseline=eval$baseline, support=eval$support),
		FUN=mean
	)

	print(res)

	names(res) = c('method', 'support', 'precision') 
	
	res$method = mapvalues(
		res$method, 
		from=c('AprioriBased', 'PopularityBased'),
		to=c('Apriori-Based', 'Popularity-Based')
	)

	res$method = paste(res$method, '/', res$support)
	res$support = NULL

	print(res)

	# Only keep best performing apriori-based

	

	return(res)
}



CreateTopList <- function(kDatasetName) {
	methodResults			= CreateMethodResults(kDatasetName)
	baselineResults 		= CreateBaselineResults(kDatasetName)
	
	methodCol <- paste(methodResults$distance, '/', methodResults$markov, '/',  methodResults$strategy)
	merged <- data.frame(
		methodCol, 
		methodResults$precision
	)

	names(merged) <- c('method', 'precision')
	merged <- rbind(merged, baselineResults)
	merged <- merged[order(-merged$precision),]

	return(merged)
}
