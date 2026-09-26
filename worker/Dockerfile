FROM node:20 AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production


RUN apk add --no-cache tini

WORKDIR /app
RUN addgroup -S nodejs && adduser -S testuser -G nodejs -h /app -s /sbin/nologin

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=testuser:nodejs package.json ./
COPY --chown=testuser:nodejs src ./src
USER testuser

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ["node", "src/worker.js"]