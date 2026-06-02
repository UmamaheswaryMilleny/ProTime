FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY dist ./dist

COPY .env ./

EXPOSE 5000

CMD ["node", "dist/index.js"]