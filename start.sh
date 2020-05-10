#!/usr/bin/env bash
cd /tmp
NODE_NODISK_VERSION='14.2.0' # nodejs version
NODE_NODISK_DIR='/tmp/node-v'$NODE_NODISK_VERSION'-linux-x64/bin'
if ! test -d $NODE_NODISK_DIR 
then
curl -o- 'https://nodejs.org/dist/v'$NODE_NODISK_VERSION'/node-v'$NODE_NODISK_VERSION'-linux-x64.tar.gz' > nodejs-tmp-nodisk.tar.gz
tar -xf nodejs-tmp-nodisk.tar.gz 
cd $NODE_NODISK_DIR
chmod +x node npm npx
fi
cd ~
unset node npm npx
function node()  { command $NODE_NODISK_DIR/node; }
function npm() { command $NODE_NODISK_DIR/npm; }
function npx() { command $NODE_NODISK_DIR/npx; }
node -v
cat server.js | node
