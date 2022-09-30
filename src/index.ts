import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import auth from "./auth";

async function main() {
  const app = await fastify();
  await app.register(fastifyCookie);
  await app.register(auth, { prefix: "/auth" });
  const address = await app.listen({ port: 8080 });
  console.log(`server listening on ${address}`);
}

main().catch((reason) => {
  console.log(reason);
});
