FROM node:25.6.1-alpine3.23 AS builder

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i

COPY tsconfig.json tsconfig.json
COPY src src

RUN npm run build

FROM node:25.6.1-alpine3.23

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY package.json package.json
COPY package.lock.json package.lock.json
RUN npm i

CMD ["npm", "run", "start"]