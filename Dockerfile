# Use the official Bun image - updated to Bun 1.3.8
FROM oven/bun:1.3.8 AS builder

WORKDIR /app

ARG FIREBASE_SERVICE_ACCOUNT
ARG PUBLIC_FIREBASE_CONFIG

ENV FIREBASE_SERVICE_ACCOUNT=${FIREBASE_SERVICE_ACCOUNT}
ENV PUBLIC_FIREBASE_CONFIG=${PUBLIC_FIREBASE_CONFIG}

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun --bun run build

# Production stage
FROM oven/bun:1.3.8

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "./build/index.js"]
