FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

RUN npm install

# Copy finance-app source
COPY finance-app/src ./src/
COPY finance-app/public ./public/ 2>/dev/null || true
COPY finance-app/prisma ./prisma/
COPY finance-app/next.config.js ./
COPY finance-app/tailwind.config.ts ./
COPY finance-app/tsconfig.json ./
COPY finance-app/postcss.config.js ./
COPY finance-app/.env* ./
COPY tailwind.config.ts ./
COPY next.config.js ./

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
