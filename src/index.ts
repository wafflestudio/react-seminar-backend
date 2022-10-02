import fastifyCookie from "@fastify/cookie";
import fastify from "fastify";
import mysql, { Connection } from "mysql2/promise";
import auth from "./auth";
import { RefreshTokenModel } from "./auth/tokenModel";
import { AuthService } from "./auth/service";
import { mysqlSettings } from "./lib/db";
import { tokenPlugin } from "./lib/tokens";
import { OwnerModel } from "./owners/model";

declare module "fastify" {
  export interface FastifyInstance {
    db: Connection;
    ownerModel: OwnerModel;
    tokenModel: RefreshTokenModel;
    authService: AuthService;
  }
}

async function main() {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
      },
      level: "debug",
    },
  });

  app.decorate("db", mysql.createConnection(mysqlSettings));
  app.decorate("ownerModel", new OwnerModel(app.db));
  app.decorate("tokenModel", new RefreshTokenModel(app.db));
  app.decorate("authService", new AuthService(app.ownerModel, app.tokenModel));

  await app.register(fastifyCookie);
  await app.register(tokenPlugin);
  await app.register(auth, { prefix: "/auth" });
  await app.listen({ port: 8080 });
}

main().catch((reason) => {
  console.log(reason);
});
