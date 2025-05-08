# Use Node.js base image
FROM node:18-slim

# Install Puppeteer's required dependencies
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm1 \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Skip Chromium download during npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy the application code, including build.sh and fetchAndStoreSecrets.js
COPY . .

RUN npm install

# Ensure the start script is executable
RUN chmod +x build.sh

# Ensure the /app directory is writable by the node user
RUN chown -R node:node /app

# Switch to the node user for security
USER node

# Expose the port the app runs on
EXPOSE 8080

# Set environment variable to tell Puppeteer to use the installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Note: Set ENVIRONMENT via Cloud Run configuration, e.g., ENVIRONMENT=UAT
# Ensure the Cloud Run service account has Secret Manager Secret Accessor role

# Use the start script as the command to run
CMD ["./build.sh"]

# # Use Node.js base image
# FROM node:18-slim

# # Install Puppeteer's required dependencies
# RUN apt-get update && apt-get install -y \
#   wget \
#   ca-certificates \
#   fonts-liberation \
#   libappindicator3-1 \
#   libasound2 \
#   libatk-bridge2.0-0 \
#   libatk1.0-0 \
#   libcups2 \
#   libdbus-1-3 \
#   libgdk-pixbuf2.0-0 \
#   libnspr4 \
#   libnss3 \
#   libx11-xcb1 \
#   libxcomposite1 \
#   libxdamage1 \
#   libxrandr2 \
#   xdg-utils \
#   libgbm1 \
#   --no-install-recommends && \
#   apt-get clean && rm -rf /var/lib/apt/lists/*

# # Set working directory
# WORKDIR /app

# COPY package*.json ./
# # Skip Chromium download during npm install
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# RUN npm install
# COPY . .

# # Expose port and run
# EXPOSE 8080

# # Set environment variable to tell Puppeteer to use the installed Chromium
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# CMD [ "npm", "start" ]
