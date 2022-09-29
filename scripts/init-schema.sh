source .env
mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD $MYSQL_DATABASE < scripts/init-schema.sql