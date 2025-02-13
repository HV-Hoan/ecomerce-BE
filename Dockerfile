# Dockerfile
FROM node:18

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Chạy ứng dụng
CMD ["npm", "start"]