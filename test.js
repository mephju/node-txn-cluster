var a = 'create table tftidttest \
				as 											\
				select 		cic.cluster_id, 				\
							cic.item_id, 					\
							cic.count 				as tf,	\
							icc.count 				as df,	\
							cc.N, 							\
							cic.count*log10(cc.N/icc.count)	as tfidf 	\
				from 		levenshtein_x_validation_run_1_cluster_item_counts as cic, \
							levenshtein_x_validation_run_1_item_cluster_counts as icc,	\
							item_counts 			as ic,	\
							(select 	count(*) 	as N 	\
							from levenshtein_x_validation_run_1_clusters)   as cc 	\
				where 	cic.item_id=icc.item_id 			\
				and 	icc.item_id=ic.item_id;' 
console.log(a)

/*
create table tftidttest 				
as 															
select 		cic.cluster_id, 	cic.item_id, 												
cic.count 				as tf,								
icc.count 				as df,								
cc.N, 														
cic.count*log10(cc.N/icc.count)	as tfidf 					
from 		levenshtein_x_validation_run_1_cluster_item_counts as cic, 	
			levenshtein_x_validation_run_1_item_cluster_counts as icc,					
			item_counts 			as ic,								
			(select 	count(*) 	as N 								
			from levenshtein_x_validation_run_1_clusters)   as cc 					
			where 	cic.item_id=icc.item_id 	
			and 	icc.item_id=ic.item_id;



			 create table jaccard_bigram_x_validation_run_1_cluster_item_tfidf		as 										select 		cic.cluster_id, 						cic.item_id, 									cic.count 				as tf,					icc.count 				as df,					cc.N, 										cic.count*log10(cc.N/icc.count)	as tfidf 					from jaccard_bigram_x_validation_run_1_cluster_item_counts as cic, jaccard_bigram_x_validation_run_1_item_cluster_counts as icc,					item_counts 			as ic,						(select 	count(*) 	as N 							from jaccard_bigram_x_validation_run_1_clusters)   as cc 			where 	cic.item_id=icc.item_id 						and 	icc.item_id=ic.item_id; 
 */