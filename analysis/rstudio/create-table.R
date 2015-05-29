

CreateMeanResults <- function(dataset.name) {
	eval <- read.csv(
		'../movielens_more.csv', 
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

	res <- res[order(res$distance),]

	res$precision = round(res$precision, digits=4)


	strategies = c(
		'tfidf', 
		'tfTfidf', 
		'withRatings', 
		'bestItemsOverall', 
		'bestItemsOfCluster', 
		'random'
	)

	subframes = data.frame()
	for(strategy in strategies) {
		assign(
			paste0('subframes.', strategy), 
			MakeSubFrame(res, strategy)
		)
	}
	
	res <- merge(subframes.tfidf, subframes.random)
	res <- merge(res, subframes.tfTfidf)
	res <- merge(res, subframes.bestItemsOfCluster)
	res <- merge(res, subframes.bestItemsOverall)
	res <- merge(res, subframes.withRatings)

	res <- data.frame(res$distance, res$markov, res$withRatings)

	print(res)
	return(res)
} 


MakeSubFrame <- function(frame, colname) {
	subframe = frame[frame$strategy == colname,]
	names(subframe)[names(subframe) == 'precision'] <- colname
	subframe <- subframe[-3]
	return(subframe)
}

res = CreateMeanResults('movielens')



