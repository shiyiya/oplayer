#!/bin/bash
# Build docs: v2 at root, v1 at /1/
# Must be run from monorepo root

set -ex

rm -rf packages/docs/out packages/docs/out-v1

echo "📦 Building docs for v1 (/1/)..."
DOCS_BASE_PATH=/1 pnpm --filter @oplayer/docs run build:v1
mv packages/docs/out packages/docs/out-v1

echo "📦 Building docs for v2 (root)..."
pnpm --filter @oplayer/docs run build:v2

echo "📂 Merging..."
mkdir -p packages/docs/out/1
cp -r packages/docs/out-v1/* packages/docs/out/1/
rm -rf packages/docs/out-v1

echo "✅ Docs built: root (v2) and /1/ (v1)"
