FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g pnpm && \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/main.js"]
