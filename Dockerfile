FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (assuming your app runs on port 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]