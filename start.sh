#!/usr/bin/env bash
NCBBASEDIR=$(dirname "$0")
cd $NCBBASEDIR
node --max-old-space-size=6000 .
