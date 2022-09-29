import fastify from "fastify";
import auth from "./auth";

(async function () {
  const app = await fastify();
  await app.register(auth);
  const address = await app.listen();
  console.log(`server listening on ${address}`);
})().catch((reason) => {
  console.log(reason);
});
