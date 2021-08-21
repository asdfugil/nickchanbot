#!/usr/bin/env bash
. ~/.nvm/nvm.sh
nvm use 16 > /dev/null
node --max-old-space-size=1024 --stack-size=9999999 . $@
