import { PrismaClient } from "@prisma/client";
import { OwnerModel } from "../src/owners/model";
import students from "./students";
import "../src/lib/env";

async function main() {
  const conn = new PrismaClient();
  const n = await conn.owner.findMany().then((owners) => owners.length);
  if (n > 0) {
    console.log("Already initialized");
    return;
  }
  const ownerModel = new OwnerModel(conn);
  await ownerModel.insertMany(
    students.map((student) => ({
      username: student.github_id,
      password: student.name,
    }))
  );
}

main()
  .then(() => process.exit(0))
  .catch((reason) => {
    console.log(reason);
    return process.exit(1);
  });
