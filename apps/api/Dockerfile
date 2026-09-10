FROM node:24.18.0-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspaces --include-workspace-root --ignore-scripts
COPY packages/shared packages/shared
COPY apps/api apps/api
ENV POSTGRES_USER=build POSTGRES_PASSWORD=build POSTGRES_DB=build
RUN npm run build -w packages/shared
RUN npm run prisma:generate -w apps/api
RUN npm run build -w apps/api
RUN npm run seed:build -w apps/api
RUN npm prune --omit=dev --ignore-scripts

FROM node:24.18.0-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /repo
ENV NODE_ENV=production
ENV API_PORT=3333
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
COPY --from=build /repo/apps/api/src/database ./apps/api/src/database
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
WORKDIR /repo/apps/api
EXPOSE 3333
CMD ["sh", "-c", "npx prisma migrate deploy && exec node dist/main.js"]
