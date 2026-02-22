FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

RUN npm install

# Copy finance-app source
COPY finance-app/src ./src/
COPY finance-app/prisma ./prisma/
COPY finance-app/next.config.js ./
COPY finance-app/tailwind.config.ts ./
COPY finance-app/tsconfig.json ./
COPY finance-app/postcss.config.js ./
COPY finance-app/.env* ./
COPY tailwind.config.ts ./
COPY next.config.js ./

# Copy public if it exists
RUN if [ -d "finance-app/public" ]; then cp -r finance-app/public ./; fi

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
