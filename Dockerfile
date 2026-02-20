FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S server -u 1001 -G nodejs

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder --chown=server:nodejs /app/dist ./dist

USER server

HEALTHCHECK --interval=3s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
