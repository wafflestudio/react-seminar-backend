import "../src/lib/env";
import { PrismaClient } from "@prisma/client";
import { RefreshTokenModel } from "../src/auth/model";

async function main() {
  const prisma = new PrismaClient();
  const model = new RefreshTokenModel(prisma);
  await model.purge();
}

main()
  .then(() => process.exit(0))
  .catch((reason) => {
    console.error(reason);
    process.exit(1);
  });
