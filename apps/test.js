var table = {
	clusterMembers: 'jaccard_bigram_x_validation_run_0_cluster_members',

}

var sql = 'select distinct 					\
					tic.item_id  			\
		from 	' + table.clusterMembers + ' as cm, 	\
					txn_item_counts as tic 		\
		where 		cm.cluster_id=$1 		\
		and 		tic.txn_id=cm.txn_id    \
		order by 	tic.count desc 			\
		limit ' 	+ 5



console.log(sql)