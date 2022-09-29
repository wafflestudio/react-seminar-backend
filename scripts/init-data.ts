import { createOwners } from "../src/owners/models";
import students from "./students";

async function main() {
  await createOwners(
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
