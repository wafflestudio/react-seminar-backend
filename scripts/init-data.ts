import { PrismaClient } from "@prisma/client";
import { OwnerModel } from "../src/owners/model";
import students from "./students";
import "../src/lib/env";

async function main() {
  const conn = new PrismaClient();
  const ownerModel = new OwnerModel(conn);
  await ownerModel.insertMany(
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
