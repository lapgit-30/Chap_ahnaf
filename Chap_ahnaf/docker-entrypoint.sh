#!/bin/sh
set -eu

npx drizzle-kit push
npx tsx src/db/seed.ts
exec ./node_modules/.bin/next start --hostname 0.0.0.0 --port "${PORT:-3000}"
