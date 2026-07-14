FROM node:25.6.1-alpine3.23 AS base

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i

COPY tsconfig.json tsconfig.json
COPY nodemon.json nodemon.json
COPY src src
RUN mkdir -p uploads

FROM base AS dev

CMD ["npm", "run", "dev"]

FROM base AS builder

RUN npm run build

FROM node:25.6.1-alpine3.23 AS production

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i

CMD ["npm", "run", "start"]