echo "================ DEPLOY SCRIPT ================="
echo "$ yarn build"
yarn build
echo "$ scp ./build remote:~/project/"
scp -r -i "$KEY_FILE" ./build "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_ROOT/"
echo "$ ssh remote update"
ssh -i "$KEY_FILE" "$REMOTE_USER@$REMOTE_HOST" "cd \"$REMOTE_PROJECT_ROOT\" && git pull && sh ./script/update.sh"