FROM node:18-slim

# Install system dependencies for Prisma Compatibility
RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["sh", "-c", "npx prisma db push && npx prisma db seed && npm start"]
