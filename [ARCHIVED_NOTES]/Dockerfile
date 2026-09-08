# This is the main Dockerfile for the application
# Render will use this to determine how to build the service

# For multi-service deployment on Render, you need to:
# 1. Set the root directory in Render settings
# 2. Or specify the correct Dockerfile path in render.yaml

# This file serves as a placeholder that directs to the correct service

FROM node:20-alpine

# Backend build stage (if deploying backend)
FROM node:20-alpine AS backend-build

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend/src ./src
COPY backend/tsconfig.json ./

RUN npm run build

# Production stage for backend
FROM node:20-alpine AS backend-prod

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY backend/package*.json ./

RUN npm ci --omit=dev

COPY --from=backend-build /app/dist ./dist

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

# Frontend build stage (if deploying frontend)
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend . .

RUN npm run build

# Production stage for frontend
FROM node:20-alpine AS frontend-prod

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY frontend/package*.json ./

RUN npm ci --omit=dev

COPY --from=frontend-build /app/.next ./.next

# Copy public directory if it exists
RUN mkdir -p ./public
RUN cp -r /app/public/* ./public/ 2>/dev/null || echo "No public files to copy"

USER node

EXPOSE 3001

ENV PORT=3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
