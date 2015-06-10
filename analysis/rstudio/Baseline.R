# install.packages("jsonlite", repos="http://cran.r-project.org")
library(jsonlite)

CreateBaselineResults <- function() {
	eval <- read.csv(
		'../movielens_baseline_more.csv', 
		header=TRUE
	)

	res <- aggregate(
		eval$precision,
		by=list(
			baseline=eval$baseline
		),
		FUN=mean
	)

	names(res) = c('method', 'precision') 
	
	res$method = mapvalues(
		res$method, 
		from=c('AprioriBased', 'PopularityBased'),
		to=c('Apriori-Based', 'Popularity-Based')
	)

	
	res$precision = round(res$precision, digits=4)

	return(res)
}

