# Use the official Node.js image (Version 20 is stable)
FROM node:20

# Create a directory inside the container for our app
WORKDIR /usr/src/app

# Copy your local files into the container
COPY . .

# The command to run your app
CMD ["node", "server.js"]