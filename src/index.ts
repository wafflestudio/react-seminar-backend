import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import authRoutes from "./auth/routes";
import ownersRoutes from "./owners/routes";
import menuRoutes from "./menus/routes";
import { RefreshTokenModel } from "./auth/model";
import { AuthService } from "./auth/service";
import { tokenPlugin } from "./lib/tokens";
import { OwnerModel } from "./owners/model";
import { OwnerService } from "./owners/service";
import { PrismaClient } from "@prisma/client";
import { MenuModel } from "./menus/models";
import { MenuService } from "./menus/service";
import { ownerSchema } from "./owners/schema";
import { menuSchema } from "./menus/schema";

declare module "fastify" {
  export interface FastifyInstance {
    db: PrismaClient;
    ownerModel: OwnerModel;
    tokenModel: RefreshTokenModel;
    menuModel: MenuModel;
    authService: AuthService;
    ownerService: OwnerService;
    menuService: MenuService;
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

  const registry = Promise.all([
    app.register(fastifySwagger, {
      exposeRoute: true,
      routePrefix: "docs",
      logLevel: "debug",
      openapi: {
        info: {
          title: "Wafl Studio API",
          description: "와플스튜디오 2022 리액트 세미나 과제를 위한 백엔드",
          version: "1.0",
        },
        components: {
          securitySchemes: {
            bearer: {
              type: "http",
              scheme: "bearer",
            },
          },
        },
      },
    }),
    app.register(fastifyCookie),
    app.register(tokenPlugin),
    app.register(authRoutes, { prefix: "/auth" }),
    app.register(ownersRoutes, { prefix: "/owners" }),
    app.register(menuRoutes, { prefix: "/menus" }),
  ]);

  app.addSchema(ownerSchema);
  app.addSchema(menuSchema);
  app.decorate("db", new PrismaClient());
  app.decorate("ownerModel", new OwnerModel(app.db));
  app.decorate("tokenModel", new RefreshTokenModel(app.db));
  app.decorate("menuModel", new MenuModel(app.db));
  app.decorate("authService", new AuthService(app.ownerModel, app.tokenModel));
  app.decorate("ownerService", new OwnerService(app.ownerModel));
  app.decorate("menuService", new MenuService(app.menuModel));

  await registry;

  await app.listen({ port: 8080, host: "0.0.0.0" });
}

main().catch((reason) => {
  console.log(reason);
});
