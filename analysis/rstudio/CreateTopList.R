
source('./Baseline.R')


CreateMethodResults <- function() {
	eval <- read.csv(
		'../lastfm_more.csv', 
		header=TRUE
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

	res$precision = round(res$precision, digits=4)
	res <- res[1:10,]
	
	return(res)
} 

CreateTopList <- function() {
	methodResults			= CreateMethodResults()
	#baselineResults 		= CreateBaselineResults()
	
	methodCol <- paste(methodResults$distance, '/', methodResults$markov, '/',  methodResults$strategy)
	merged <- data.frame(
		methodCol, 
		methodResults$precision
	)

	names(merged) <- c('method', 'precision')
	#merged <- rbind(merged, baselineResults)
	merged <- merged[order(-merged$precision),]

	print(merged)

	return(merged)
}
