FROM node:20-alpine

WORKDIR /app

# Cài đặt các công cụ cần thiết để biên dịch native addon
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./

# Cài đặt và đảm bảo build từ source bên trong môi trường Linux
RUN npm install

COPY . .

RUN npm run build
EXPOSE 3001

CMD ["npm", "run", "start"]