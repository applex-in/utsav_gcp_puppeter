# #!/bin/bash

# echo "Starting build.sh script..."

# # Run the Node.js script to fetch secrets and write to .env
# echo "Running fetchAndStoreSecrets.js..."
# node fetchAndStoreSecrets.js
# EXIT_CODE=$?

# if [ $EXIT_CODE -ne 0 ]; then
#   echo "Error: fetchAndStoreSecrets.js failed with exit code $EXIT_CODE"
#   exit $EXIT_CODE
# fi

# # Check if the .env file was created successfully
# if [ ! -f .env ]; then
#   echo "Error: .env file was not created."
#   exit 1
# fi

# echo ".env file created successfully."
# echo "Contents of .env:"
# cat .env

# # Start the Node.js application
# echo "Starting the application with npm start..."
# npm start

#!/bin/bash
echo "🔐 Starting server with environment: $ENVIRONMENT"
echo "Available environment variables:"
env

# Start the app
node index.js