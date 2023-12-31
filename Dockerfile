FROM node:19.9.0
ARG ARG_JWT_SECRET
ENV JWT_SECRET=${ARG_JWT_SECRET}

WORKDIR /app
COPY package.json yarn.lock tsconfig.json ./
RUN yarn
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
COPY scripts ./scripts
RUN yarn build
RUN mkdir -p /app/storage
RUN npx prisma migrate deploy
RUN yarn init-data
RUN mv /app/storage/dev.db ./
CMD (if [ ! -e /app/storage/dev.db ]; then mv ./dev.db /app/storage/dev.db; fi) && yarn start
