FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
RUN npm run build

FROM node:20 AS prod-deps

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
COPY prisma ./prisma/
COPY src ./src/
COPY prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

FROM node:20-slim

RUN apt-get update && apt-get install -y \
    libvips \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/src/main"]