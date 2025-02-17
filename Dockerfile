FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set environment variables (if no .env file is provided)
# ENV API_URL=https://smartcity.heraklion.gr/api
# ENV PORT=9010
# ENV HOST="0.0.0.0"

# Expose the application's port
EXPOSE 9010

# Start the application
CMD ["node", "app.js"]
