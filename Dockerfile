# syntax=docker/dockerfile:1

FROM node:24.20.0-bookworm-slim AS deps
WORKDIR /app

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:24.20.0-bookworm-slim AS builder
WORKDIR /app

ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

FROM nginxinc/nginx-unprivileged:1.31-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
