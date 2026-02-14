#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../contracts"

npm run compile
npm run deploy
