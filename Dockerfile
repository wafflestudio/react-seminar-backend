FROM ubuntu:20.04
ARG ARG_JWT_SECRET
ENV JWT_SECRET=${ARG_JWT_SECRET}

# Install Node.js
RUN apt update && apt install -y curl ca-certificates gnupg
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" > /etc/apt/sources.list.d/nodesource.list
RUN apt update && apt install -y nodejs

# Install Yarn
RUN npm install -g yarn

# Install mysql
ENV DEBIAN_FRONTEND=noninteractive
RUN echo "" | apt install -y mysql-server mysql-client
RUN service mysql start && mysql -e "CREATE DATABASE waffle; CREATE USER waffle IDENTIFIED BY 'waffle'; GRANT ALL PRIVILEGES ON *.* TO waffle"

WORKDIR /app
COPY . .
RUN yarn
RUN npx prisma generate
RUN yarn build
RUN service mysql start && npx prisma migrate deploy
RUN service mysql start && yarn init-data
CMD mysqld & yarn start
