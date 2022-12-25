#!/bin/bash

if ! [ -x "$(command -v tsc)" ]; then
  echo 'Error: TypeScript is not installed.' >&2
  exit 1
fi

if [ -d "node_modules" ]; then
  continue
else
  echo "node_modules directory does not exist"
  npm i
fi

echo "Building project..."
npm run build 
echo "Done building project"

echo "Starting project..."
npm run start

while true
do
  echo -ne "#"
  sleep 1
don