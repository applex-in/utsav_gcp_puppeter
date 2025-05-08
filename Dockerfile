# Use official Node.js slim base image
FROM node:18-slim

# Install necessary dependencies including Chromium for puppeteer-core
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
  chromium \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set environment variable to avoid downloading Chromium again
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package.json and lock file first (Docker cache optimization)
COPY package*.json ./

# Install dependencies
RUN echo "📦 Installing NPM dependencies..." && \
    npm install --verbose && \
    echo "✅ NPM install complete"

# Copy app source code
COPY . .

# Make start script executable (if needed)
RUN chmod +x build.sh || true

# Ensure directory permissions and security best practice
RUN chown -R node:node /app
USER node

# Expose the port your app listens on
EXPOSE 8080

# Run the server
CMD ["npm", "start"]

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
