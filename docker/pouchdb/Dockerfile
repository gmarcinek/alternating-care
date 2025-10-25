# Use Node.js 20 alpine as base image
FROM node:20-alpine

# Install pouchdb-server globally
RUN npm install -g pouchdb-server@4.2.0

# Set working directory for pouchdb data
WORKDIR /data

# Expose default PouchDB port
EXPOSE 5984

# Run pouchdb-server storing data in /data
CMD ["pouchdb-server", "--dir", "/data", "--port", "5984", "--host", "0.0.0.0"]
