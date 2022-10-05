import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import authRoutes from "./auth/routes";
import ownersRoutes from "./owners/routes";
import { RefreshTokenModel } from "./auth/tokenModel";
import { AuthService } from "./auth/service";
import { tokenPlugin } from "./lib/tokens";
import { OwnerModel } from "./owners/model";
import { OwnerService } from "./owners/service";
import { PrismaClient } from "@prisma/client";
import { MenuModel } from "./menus/models";

declare module "fastify" {
  export interface FastifyInstance {
    db: PrismaClient;
    ownerModel: OwnerModel;
    tokenModel: RefreshTokenModel;
    menuModel: MenuModel;
    authService: AuthService;
    ownerService: OwnerService;
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

  app.decorate("db", new PrismaClient());
  app.decorate("ownerModel", new OwnerModel(app.db));
  app.decorate("tokenModel", new RefreshTokenModel(app.db));
  app.decorate("menuModel", new MenuModel(app.db));
  app.decorate("authService", new AuthService(app.ownerModel, app.tokenModel));
  app.decorate("ownerService", new OwnerService(app.ownerModel));
  await app.register(fastifySwagger, {
    exposeRoute: true,
    routePrefix: "docs",
    logLevel: "debug",
  });

  await app.register(fastifyCookie);
  await app.register(tokenPlugin);
  await app.register(authRoutes, { prefix: "/auth" });
  await app.register(ownersRoutes, { prefix: "owners" });
  await app.listen({ port: 8080 });
}

main().catch((reason) => {
  console.log(reason);
});
