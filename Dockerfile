# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production server ────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app
COPY backend/package.json ./
RUN npm install --omit=dev

COPY backend/ ./

# Copy the built React app into backend/public so Express can serve it
COPY --from=frontend-builder /build/frontend/dist ./public

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server.js"]
