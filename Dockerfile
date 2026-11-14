FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_AUTH_URL
ARG VITE_PAYMENT_URL
ARG VITE_BRASIL_API_BASE_URL
ARG VITE_FX_BRL_EUR
ARG VITE_FX_BRL_USD
RUN npm run build

FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
