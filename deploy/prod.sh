#!/bin/bash
git pull
NODE_ENV=production gulp build --release
pm2 restart imota-prod
tailf ~/.pm2/logs/imota-prod-out-0.log
