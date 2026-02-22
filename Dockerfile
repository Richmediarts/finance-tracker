FROM node:20-alpine

WORKDIR /app

# Copy package files from finance-app
COPY finance-app/package*.json ./
COPY finance-app/prisma ./prisma/

RUN npm install

# Copy source from finance-app
COPY finance-app/ ./

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
