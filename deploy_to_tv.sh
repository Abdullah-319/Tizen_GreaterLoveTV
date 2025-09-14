#!/bin/bash

# Greater Love TV - Tizen TV Deployment Script
# This script automates the build and deployment process to Samsung Tizen TV

set -e  # Exit on any error

echo "🚀 Greater Love TV - Tizen Deployment Started"
echo "=============================================="

# TV Configuration
TV_IP="192.168.20.7"
TV_PORT="26101"
TV_DEVICE="UA43AU8000UXZN"
APP_ID="i2GNpZ28BV.GreaterLoveTV"

# Step 1: Clean previous builds
echo "🧹 Cleaning previous build artifacts..."
rm -rf .buildResult .sign *.wgt .manifest.tmp temp_package

# Step 2: Connect to TV
echo "📺 Connecting to TV at $TV_IP..."
sdb connect $TV_IP:$TV_PORT

# Verify connection
echo "🔍 Verifying TV connection..."
sdb devices

# Step 3: Uninstall previous version (if exists)
echo "🗑️ Uninstalling previous app version..."
tizen uninstall -p $APP_ID -t $TV_DEVICE || echo "No previous version found"

# Step 4: Create clean build environment (fixes signing issues)
echo "🔨 Creating clean build environment..."
rm -rf temp_package
mkdir temp_package
cp config.xml index.html temp_package/
cp -r css js images temp_package/

# Step 5: Build from clean directory
echo "📦 Building from clean directory..."
cd temp_package
find . -name "*.DS_Store" -delete
tizen build-web
tizen package -t wgt

# Step 6: Prepare for installation
echo "📝 Preparing package for installation..."
cd ..
cp "temp_package/Greater Love TV.wgt" GreaterLoveTV_deploy.wgt

# Step 7: Install on TV
echo "📲 Installing app on TV..."
tizen install -n GreaterLoveTV_deploy.wgt -t $TV_DEVICE

# Step 8: Launch the application
echo "🎬 Launching Greater Love TV on TV..."
tizen run -p $APP_ID -t $TV_DEVICE

echo ""
echo "✅ Deployment completed successfully!"
echo "🎉 Greater Love TV is now running on your Samsung TV!"
echo ""
echo "📋 TV Remote Controls:"
echo "   ⬅️➡️⬆️⬇️  Navigate between elements"
echo "   ⭕ OK/Enter  Select/Play content"
echo "   🔙 Back      Return to previous screen"
echo "   🏠 Home      Exit app"
echo ""
echo "🔧 To redeploy in future, simply run:"
echo "   ./deploy_to_tv.sh"