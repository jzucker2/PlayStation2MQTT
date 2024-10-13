# https://github.com/nodejs/docker-node/issues/1589
ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION} AS builder

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

ARG NPM_VERSION=10.9.0
RUN npm install -g npm@${NPM_VERSION}

COPY package.json .
COPY yarn.lock .

RUN yarn install --network-timeout 100000 --immutable --production

# Now copy over only essentials for the runner
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules

COPY package.json .
COPY src .

RUN mkdir -p $HOME/.config/playactor

# this needs to match the env var in the app
EXPOSE 4242

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
    CMD wget -nv -t1 --spider 'http://0.0.0.0:4242/-/health' || exit 1

CMD ["npm", "start"]
