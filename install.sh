sudo apt update
curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash - && sudo apt-get install -y nodejs
sudo npm -g i yarn pm2
yarn
echo "DATABASE_URL=\"$(yarn make-db-url | sed '3q;d')\"" >> .env
npx prisma migrate deploy
yarn build
pm2 --name assignment-backend start "build/index.js"