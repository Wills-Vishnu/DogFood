FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tailwind.config.js postcss.config.js ./
COPY public ./public
COPY src ./src
ARG REACT_APP_DEMO_ACCOUNTS=true
ENV REACT_APP_DEMO_ACCOUNTS=$REACT_APP_DEMO_ACCOUNTS
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
