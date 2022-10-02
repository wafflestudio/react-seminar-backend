import mysql from "mysql2/promise";
import { mysqlSettings } from "../src/lib/db";
import { OwnerModel } from "../src/owners/model";
import students from "./students";

async function main() {
  const conn = await mysql.createConnection(mysqlSettings);
  const ownerModel = new OwnerModel(conn);
  await ownerModel.createMany(
    students.map((student) => ({
      username: student.github_id,
      password: student.github_id,
    }))
  );
}

main()
  .then(() => process.exit(0))
  .catch((reason) => {
    console.log(reason);
    return process.exit(1);
  });
