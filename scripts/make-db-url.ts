import { MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD } from "../src/lib/env";

console.log(
  `mysql://${encodeURI(MYSQL_USERNAME)}:${encodeURI(
    MYSQL_PASSWORD
  )}@localhost/${encodeURI(MYSQL_DATABASE)}`
);
