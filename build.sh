#!/bin/bash
echo "🔐 Starting server with environment: $ENVIRONMENT"
echo "Available environment variables:"
env

# Start the app
node index.js