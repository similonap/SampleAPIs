ARG NODE_VERSION=18.0.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV development

WORKDIR /usr/src/app

# Copy the rest of the source files into the image.
COPY client .
RUN npm install
RUN npm i -g serve
RUN npm run build

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD [ "serve", "-s", "dist" ]

