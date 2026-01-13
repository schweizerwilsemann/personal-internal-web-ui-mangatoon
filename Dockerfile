# Base image nhẹ, nhanh
FROM node:22-alpine

# Set working dir
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Cài deps bằng Yarn
RUN yarn install

# Copy toàn bộ project code
COPY . .

# Build project
RUN yarn build

# Mở cổng
EXPOSE 3999

# Lệnh chạy app
CMD ["yarn", "start", "-p", "3999"]
