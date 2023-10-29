FROM node:21-alpine

WORKDIR /app
COPY . .
RUN npm ci

CMD ["npm", "start"]
EXPOSE 3000