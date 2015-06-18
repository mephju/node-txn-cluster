CreateBarChart <- function(data, kPathPrefix, kDatasetName) {
	bar.chart = ggplot(
		data=data, 
		aes(reorder(method, precision), y=precision)
	) + 
	geom_bar(
		stat="identity"
	) +
	scale_x_discrete(name='Method') +
	scale_y_continuous('Precision') +
	theme(
		legend.position="none",
		axis.title.x = element_text(colour='#858585'),
		axis.title.y = element_text(colour='#858585')
		#plot.margin = unit(c(2, 2, 2, 2), "inches")
	) +
	coord_flip() 

	filename = paste(kPathPrefix, kDatasetName, '-results.pdf', sep='')
	print(bar.chart)
	ggsave(filename, bar.chart, width=5.8, height=4.5)
}