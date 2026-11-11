FROM node:24-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app

# 先に package.json だけコピーして依存を入れる（コードだけ変えたときは、ここをキャッシュで飛ばせる）
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# rootではなく、一般ユーザー node で動かす
USER node
EXPOSE 3000
CMD ["node", "index.js"]
