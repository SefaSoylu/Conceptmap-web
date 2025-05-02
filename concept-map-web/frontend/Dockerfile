# Build phase
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Serve phase
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html