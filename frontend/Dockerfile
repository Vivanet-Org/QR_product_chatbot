# Multi-stage build for React frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

RUN npm install -g serve
 
EXPOSE 3000
 
# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]