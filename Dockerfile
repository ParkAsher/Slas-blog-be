FROM node:18-alpine AS builder

# sharp 빌드에 필요한 패키지
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npm run build

# Prisma client 생성
RUN npx prisma generate

FROM node:18-alpine

# sharp 실행에 필요
RUN apk add --no-cache vips-dev

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000
CMD ["node", "dist/main"]