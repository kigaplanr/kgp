#!/bin/bash

echo "Building project..."
npm run build 
echo "Done building project"

echo "Starting project..."
npm run dev

while true
do
  echo -ne "#"
  sleep 1
don