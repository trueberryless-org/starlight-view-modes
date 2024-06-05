FROM node:lts AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm i
WORKDIR /app/docs
RUN pnpm run build

FROM httpd:2.4 AS runtime
COPY --from=build /app/docs/dist /usr/local/apache2/htdocs/
EXPOSE 80
EXPOSE 443