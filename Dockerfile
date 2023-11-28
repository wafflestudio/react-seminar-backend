FROM node:18
ARG ARG_JWT_SECRET
ENV JWT_SECRET=${ARG_JWT_SECRET}

WORKDIR /app
COPY . .
RUN yarn
RUN npx prisma generate
RUN yarn build
RUN mkdir -p /app/storage
RUN npx prisma migrate deploy
RUN yarn init-data
CMD ["yarn", "start"]
