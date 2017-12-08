#!/usr/bin/env python

import glob

glob_queries = [
        '../detection_model/data/filtered/issei_*',
        '../detection_model/data/filtered/chiemi_*',
        '../detection_model/data/filtered/riho_*',
        '../detection_model/data/filtered/kazuo_*',
        '../detection_model/data/filtered/sota_*',
        ]

for class_index in range(len(glob_queries)):
    query = glob_queries[class_index]
    files = glob.glob(query)
    for f in files:
        print(f, class_index)
