FROM node:14-alpine
MAINTAINER Rick Slinkman <rw.slinkman@gmail.com>

# Location to use
WORKDIR /contractpolice

# Install dependencies (cache in Docker layer)
COPY package.json package.json
RUN npm install
# Install source code
COPY . .

# Define output directory (mount destination for input files)
RUN mkdir /contractpolice/ci-contracts
RUN mkdir /contractpolice/generator

ENTRYPOINT node run-ci.js