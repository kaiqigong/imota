#!/bin/bash
git pull
NODE_ENV=production gulp build --release
pm2 restart scott-production
tailf ~/.pm2/logs/scott-prod-out-0.log
