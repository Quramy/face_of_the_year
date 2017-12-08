#!/bin/sh

rm -rf dist
mkdir -p dist
cp index.html dist
cp -rf built dist
cp -rf assets dist
yarn run gh-pages -d dist
