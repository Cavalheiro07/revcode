#!/bin/sh
set -e
# Aplica as migrations pendentes antes de subir a API.
npx prisma migrate deploy
exec node dist/server.js
