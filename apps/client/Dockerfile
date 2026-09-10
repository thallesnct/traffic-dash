FROM node:24.18.0-alpine AS build
WORKDIR /repo
ARG VITE_API_URL
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/client/package.json apps/client/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspaces --include-workspace-root --ignore-scripts
COPY packages/shared packages/shared
COPY apps/client apps/client
RUN npm run build -w packages/shared
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build -w apps/client

FROM nginx:1.27-alpine AS runtime
COPY apps/client/nginx.conf.template /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=api:3333
COPY --from=build /repo/apps/client/dist /usr/share/nginx/html
EXPOSE 80
