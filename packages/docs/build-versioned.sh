#!/bin/bash
# Build docs: v2 at root, v1 at /1/

set -e

rm -rf out out-v1

echo "📦 Building docs for v1 (/1/)..."
DOCS_BASE_PATH=/1 next build
mv out out-v1

echo "📦 Building docs for v2 (root)..."
next build

echo "📂 Merging..."
mkdir -p out/1
cp -r out-v1/* out/1/
rm -rf out-v1

echo "✅ Docs built: root (v2) and /1/ (v1)"
