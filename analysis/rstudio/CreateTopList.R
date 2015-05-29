

CreateTopList <- function(dataset.name) {
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

	res <- res[order(-res$precision),]

	res$precision = round(res$precision, digits=4)
	res <- res[1:10,]
	
	print(res)
	return(res)
} 

res = CreateTopList('movielens')



