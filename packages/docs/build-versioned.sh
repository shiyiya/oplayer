#!/bin/bash
# Build docs: v2 at root, v1 at /1/
# Must be run from monorepo root

# Redirect all stderr to stdout so Vercel captures everything
exec 2>&1

set -x

echo "=== Starting docs build ==="
echo "pwd: $(pwd)"
echo "node: $(node -v)"
echo "pnpm: $(pnpm -v 2>/dev/null || echo 'not found')"

rm -rf packages/docs/out packages/docs/out-v1

echo "=== Building docs for v1 (/1/) ==="
DOCS_BASE_PATH=/1 pnpm --filter @oplayer/docs run build:v1 || { echo "ERROR: v1 build failed"; exit 1; }
mv packages/docs/out packages/docs/out-v1 || { echo "ERROR: mv out-v1 failed"; exit 1; }

echo "=== Building docs for v2 (root) ==="
pnpm --filter @oplayer/docs run build:v2 || { echo "ERROR: v2 build failed"; exit 1; }

echo "=== Merging ==="
mkdir -p packages/docs/out/1
cp -r packages/docs/out-v1/* packages/docs/out/1/
rm -rf packages/docs/out-v1

echo "=== Done ==="
ls packages/docs/out/
ls packages/docs/out/1/
