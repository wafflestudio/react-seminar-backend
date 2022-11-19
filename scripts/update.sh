set -e

echo "$ yarn"
yarn
echo "$ prisma migrate deploy"
npx prisma migrate deploy
npx prisma generate
echo "$ pm2 reload"
pm2 reload 0
echo "$ sleep"
sleep 1s
echo "$ pm2 status"
pm2 status