#!/bin/bash
cd "$(dirname "$0")"
exec node --require tsconfig-paths/register dist/main.js "$@"
