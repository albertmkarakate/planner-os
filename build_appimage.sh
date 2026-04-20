#!/bin/bash
# DevOps Team Build Script: Student Planner OS
# This script bundles the Python environment into a relocatable AppImage

set -e # Exit on error

echo "🚀 Starting Release Pipeline for Student Planner OS"

# 1. Cleanup
rm -rf build output
mkdir -p output

# 2. Compile Python to Native Binary
# Nuitka transforms Python code into a C++ binary for maximum performance
echo "📦 Compiling with Nuitka..."
python3 -m nuitka --standalone \
                  --onefile \
                  --plugin-enable=qt-plugins \
                  --include-data-dir=assets=assets \
                  --include-data-dir=desktop=desktop \
                  --output-dir=build \
                  main.py

# 3. Download AppImage Tooling
echo "📥 Fetching deployment tools..."
wget -nc https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
wget -nc https://github.com/linuxdeploy/linuxdeploy-plugin-qt/releases/download/continuous/linuxdeploy-plugin-qt-x86_64.AppImage
chmod +x linuxdeploy*.AppImage

# 4. Create AppImage Structure
# We point to the binary produced by Nuitka
# Note: Nuitka --onefile already produces a bundle, but AppImage provides better system integration
echo "🏗️ Constructing AppImage..."

./linuxdeploy-x86_64.AppImage --appdir build/main.dist \
                              --executable build/main.bin \
                              --plugin qt \
                              --output appimage \
                              --desktop-file=assets/student-planner.desktop \
                              --icon-file=assets/icon.png

# Move result to output
mv *.AppImage output/Student_Planner_OS-x86_64.AppImage

echo "✅ Build Complete: output/Student_Planner_OS-x86_64.AppImage"
