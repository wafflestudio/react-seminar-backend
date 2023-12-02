import { PrismaClient } from "@prisma/client";
import { OwnerModel } from "../src/owners/model";
import students from "./students";
import "../src/lib/env";

async function main() {
  const conn = new PrismaClient();
  const n = await conn.owner.findMany().then((owners) => owners.length);
  for (const student of students) {
    try {
      await conn.owner.create({
        data: {
          username: student.github_id,
          password: student.name,
        },
      });
    } catch (e) {
      console.log(e);
    }
    console.log("waiting for 1 second...");
    new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log("done");
}

main()
  .then(() => process.exit(0))
  .catch((reason) => {
    console.log(reason);
    return process.exit(1);
  });
