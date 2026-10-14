FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY proto ./proto
COPY src ./src
ENV PORT=3000 GRPC_ADDRESS=0.0.0.0:50051
EXPOSE 3000 50051
CMD ["node", "src/gateway/server.js"]
