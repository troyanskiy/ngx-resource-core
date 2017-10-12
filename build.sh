#!/usr/bin/env bash

npm run clean && npm run lint && npm run build && npm run webpack

cp package.json dist/package.json
cp README.md dist/README.md
