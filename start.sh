#!/usr/bin/env bash
. ~/.nvm/nvm.sh
nvm use 14 > /dev/null
node --max-old-space-size=1024 . $@
