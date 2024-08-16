FROM node:latest

WORKDIR /app
COPY . .
RUN mkdir data

RUN npm install && npm run build

EXPOSE 3000

ENV NODE_ENV="production"

CMD ["node", "server.js"]
