#!/bin/bash
git pull
NODE_ENV=test gulp build --release
pm2 restart imota-test
tailf ~/.pm2/logs/imota-test-out-1.log
