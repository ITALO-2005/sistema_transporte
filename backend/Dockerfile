FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# instala só as dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

EXPOSE 3333
CMD ["node", "src/server.js"]
