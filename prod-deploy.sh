#!/bin/sh

# Only source if file exists (important!)
if [ -f /vault/secrets/config ]; then
  echo "Sourcing Vault secrets..."
  . /vault/secrets/config
fi

exec node server.js
