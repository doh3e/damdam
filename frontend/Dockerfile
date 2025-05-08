FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# 지금 build 스크립트 없으니까 일단 주석처리
# RUN npm run build

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

