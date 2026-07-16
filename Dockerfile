# Use the official Node.js Alpine image for a lightweight footprint
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Set environment variable to indicate the app is running in Docker
ENV DOCKERIZED=true
ENV PORT=3000

# Expose the port the server listens on
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
