#!/usr/bin/env python

import glob

glob_queries = [
        'data/filtered/issei*',
        'data/filtered/chiemi*',
        ]

for class_index in range(len(glob_queries)):
    query = glob_queries[class_index]
    files = glob.glob(query)
    for f in files:
        print(f, class_index)
