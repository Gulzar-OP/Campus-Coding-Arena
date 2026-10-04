FROM node:20-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      g++ \
      openjdk-17-jdk-headless \
      util-linux \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 10001 sandbox \
    && useradd --uid 10001 --gid 10001 --no-create-home --shell /usr/sbin/nologin sandbox

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src

ENV NODE_ENV=production \
    PORT=10000 \
    SANDBOX_UID=10001 \
    SANDBOX_GID=10001

EXPOSE 10000

CMD ["node", "src/server.js"]
