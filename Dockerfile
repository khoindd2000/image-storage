FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install

FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

EXPOSE 5000

ENV MEDIA_PATH=/media
ENV NODE_ENV=production

CMD ["node", "server.js"]