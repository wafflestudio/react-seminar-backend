import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import auth from "./auth";
import { tokenPlugin } from "./lib/tokens";

async function main() {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
      level: "debug",
    },
  });
  await app.register(fastifyCookie);
  await app.register(tokenPlugin);
  await app.register(auth, { prefix: "/auth" });
  await app.listen({ port: 8080 });
}

main().catch((reason) => {
  console.log(reason);
});
