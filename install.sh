#!/bin/bash

# Demon Lord Orchestration System (DLOS) - Installer

echo "🔥 Initializing DLOS Installation..."

# Create necessary directories
mkdir -p ~/.demonlord/core
mkdir -p ~/.demonlord/agents
mkdir -p ~/.demonlord/memory
mkdir -p ~/.demonlord/tools
mkdir -p ~/.demonlord/models
mkdir -p ~/.demonlord/runtime
mkdir -p ~/.demonlord/logs

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install aiofiles rich pydantic ollama

# Setup completion
echo "✅ DLOS Structure Ready."
echo "Structure created at ~/.demonlord/"
echo "Run 'python3 demonlord/main.py' to begin orchestration."
