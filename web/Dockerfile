FROM node:20 As build
WORKDIR /app
COPY package.json ./
COPY build.js ./
COPY public ./public 
RUN npm run build

FROM nginx:1.25.2-alpine AS runtime
RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/nginx.conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
             CMD curl -fsS http://localhost/health || exit 1

