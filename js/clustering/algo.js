1. Get frequent sequences: freqseqs
2. Create table txn_vector(txn_id, vector)
3. Get txns
4. Foreach txn
	4.0 Create vector
	4.1 Generate sequences of txn
	4.2 Foreach seq in freqseqs
		4.2.1 Measure levenstein between sequences and seq
		4.2.1 Save minimum levenshtein value in vector
	4.3 Save vector to db
5. Clustering


var freqseqs = getFrequentSequences()







