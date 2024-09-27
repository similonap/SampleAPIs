ARG NODE_VERSION=18.0.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY server .
RUN npm install -g nodemon
RUN npm install

# Expose the port that the application listens on.
EXPOSE 5555

# Run the application.
CMD npm run server