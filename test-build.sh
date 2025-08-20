#!/bin/bash

# Simple test script to verify the application builds correctly
echo "🔧 Testing Sims 4 Git Mod Manager Build..."

# Test main process build
echo "📦 Building main process..."
npm run build:main
if [ $? -ne 0 ]; then
    echo "❌ Main process build failed!"
    exit 1
fi
echo "✅ Main process build successful"

# Test renderer build
echo "🎨 Building renderer process..."
npm run build:renderer
if [ $? -ne 0 ]; then
    echo "❌ Renderer process build failed!"
    exit 1
fi
echo "✅ Renderer process build successful"

# Test linting
echo "🔍 Running linter..."
npm run lint
if [ $? -ne 0 ]; then
    echo "⚠️  Linting issues found (but not blocking)"
fi

echo "🎉 All builds completed successfully!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start development server"
echo "2. Run 'npm run pack' to create distributable package"
echo "3. Check DEVELOPMENT.md for more detailed instructions"