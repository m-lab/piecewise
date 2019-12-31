#!/bin/sh

envsubst '$PIECEWISE_BACKEND_URL' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf

cp /usr/share/nginx/html/main.js /tmp/template.js

envsubst '$PIECEWISE_BACKEND_URL' < /tmp/template.js > /usr/share/nginx/html/main.js

exec nginx -g 'daemon off;'
