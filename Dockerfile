# https://github.com/nodejs/docker-node/issues/1589
FROM node:20-alpine AS debian_base

FROM debian_base AS node_globals
ARG NPM_VERSION=10.8.3
RUN npm install -g npm@${NPM_VERSION}

# from https://github.com/nodejs/docker-node/pull/367
FROM node_globals AS node_dependencies

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY package.json package.json

COPY yarn.lock yarn.lock

# issue with `--frozen-lockfile` is the different arch/platforms
# means different lockfiles for each
# meaning this is rickety
# seems this is important for stability/package management though
# see here: https://github.com/yarnpkg/yarn/issues/4147
#RUN yarn install --frozen-lockfile
# for github actions timeouts?
RUN yarn install --network-timeout 100000

FROM node_dependencies AS source_code
COPY src/ src/

FROM source_code AS setup_env
#COPY credentials.json credentials.json

RUN mkdir -p $HOME/.config/playactor
#RUN cp credentials.json $HOME/.config/playactor/credentials.json

# this needs to match the env var in the app
EXPOSE 4242

HEALTHCHECK --interval=5s --timeout=5s --retries=3 \
    CMD wget -nv -t1 --spider 'http://0.0.0.0:4242/-/health' || exit 1

FROM setup_env AS run_server
CMD ["npm", "start"]
