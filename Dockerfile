# Builds and serves the Expo *web* target of the Peach client.
#
# The iOS and Android apps are produced by Xcode and Gradle on a developer
# machine or in EAS Build - a container cannot build them - so this image
# deliberately covers only the web bundle, which is what CI and a review
# environment can actually use.

# ---- Stage 1: install dependencies (cached on the lockfile alone) -----------
FROM node:18-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# ---- Stage 2: type-free static web build -----------------------------------
FROM node:18-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked in at build time, because a static bundle has no server to read env from.
ARG PEACH_API_URL
ENV PEACH_API_URL=${PEACH_API_URL}
RUN npx expo export:web

# ---- Stage 3: runtime ------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# nginx's own unprivileged image layout: run as a non-root user on a high port.
RUN addgroup -g 10001 -S peach \
 && adduser -u 10001 -S peach -G peach \
 && sed -i 's/listen\s*80;/listen 8080;/' /etc/nginx/conf.d/default.conf \
 && sed -i '/^user /d' /etc/nginx/nginx.conf \
 && sed -i 's#/var/run/nginx.pid#/tmp/nginx.pid#' /etc/nginx/nginx.conf \
 && sed -i 's#^\(\s*\)include /etc/nginx/conf.d/\*.conf;#\1client_body_temp_path /tmp/client_temp;\n\1proxy_temp_path /tmp/proxy_temp;\n\1fastcgi_temp_path /tmp/fastcgi_temp;\n\1uwsgi_temp_path /tmp/uwsgi_temp;\n\1scgi_temp_path /tmp/scgi_temp;\n\1include /etc/nginx/conf.d/*.conf;#' /etc/nginx/nginx.conf \
 && chown -R peach:peach /var/cache/nginx /etc/nginx/conf.d

COPY --from=build --chown=peach:peach /app/web-build /usr/share/nginx/html

USER peach
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
