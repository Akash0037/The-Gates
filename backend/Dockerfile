# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy rest of the backend code
COPY . .

# Expose port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
