#!/bin/bash
cp -r . ../scott.build
cd ../scott.build/
git pull
NODE_ENV=production gulp build --release
cd ~
rm -rf scott
mv scott.build scott
cd scott
pm2 restart scott-prod
tailf ~/.pm2/logs/scott-prod-out-0.log
