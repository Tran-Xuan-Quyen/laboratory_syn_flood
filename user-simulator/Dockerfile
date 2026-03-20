FROM node:20-alpine

WORKDIR /app
COPY package.json ./
COPY src ./src

CMD ["node", "src/main.js", "--victim1", "http://172.20.0.10:3000/projects/", "--victim2", "http://172.20.0.11:3000/projects/", "--duration", "600", "--interval", "3"]
