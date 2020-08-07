#!/usr/bin/env sh
NCBBASEDIR=$(dirname "$0")
cd $NCBBASEDIR
node --max-old-space-size=6942 . $@