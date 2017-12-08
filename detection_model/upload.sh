#!/bin/bash
BUCKET_NAME=face-of-the-year

tar cvfz data.tgz data
aws s3 cp data.tgz s3://${BUCKET_NAME}/data.tgz
aws s3 cp logs s3://${BUCKET_NAME}/archive/logs --recursive
aws s3 cp data s3://${BUCKET_NAME}/archive/data --recursive

