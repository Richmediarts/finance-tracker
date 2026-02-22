#!/bin/sh
set -e

# Resolve hostname with default
HOSTNAME="${PUBLIC_HOSTNAME:-10.0.0.225}"
TEMPLATE="/etc/nginx/conf.d/default.conf.template"
OUTPUT="/etc/nginx/conf.d/default.conf"

# Simple placeholder substitution: replace ${PUBLIC_HOSTNAME} with actual host
sed "s|\$\{PUBLIC_HOSTNAME\}|$HOSTNAME|g" "$TEMPLATE" > "$OUTPUT"

exec nginx -g 'daemon off;'
