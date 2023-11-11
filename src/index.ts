import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifyFormbody from "@fastify/formbody";
import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import authRoutes from "./auth/routes";
import { tokenPlugin } from "./lib/tokenPlugin";
import ownersRoutes from "./owners/routes";
import menuRoutes from "./menus/routes";
import reviewRoutes from "./reviews/routes";
import { RefreshTokenModel } from "./auth/model";
import { AuthService } from "./auth/service";
import { OwnerModel } from "./owners/model";
import { OwnerService } from "./owners/service";
import { PrismaClient } from "@prisma/client";
import { MenuModel } from "./menus/model";
import { MenuService } from "./menus/service";
import { ownerSchema } from "./owners/schema";
import { menuSchema } from "./menus/schema";
import { ReviewModel } from "./reviews/model";
import { reviewSchema } from "./reviews/schema";
import { ReviewService } from "./reviews/service";
import * as fs from "fs";
import path from "path";
import fastifySchedule from "@fastify/schedule";
import { AsyncTask, SimpleIntervalJob } from "toad-scheduler";

declare module "fastify" {
  export interface FastifyInstance {
    db: PrismaClient;
    ownerModel: OwnerModel;
    tokenModel: RefreshTokenModel;
    menuModel: MenuModel;
    reviewModel: ReviewModel;
    authService: AuthService;
    ownerService: OwnerService;
    menuService: MenuService;
    reviewService: ReviewService;
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
    https:
      process.env.NODE_ENV === "development" && process.env.HTTPS === "true"
        ? {
            key: fs.readFileSync(
              path.resolve(__dirname, "../localhost-key.pem")
            ),
            cert: fs.readFileSync(path.resolve(__dirname, "../localhost.pem")),
          }
        : null,
  });

  const registry = Promise.all([
    app.register(fastifySwagger, {
      exposeRoute: true,
      routePrefix: "docs",
      logLevel: "debug",
      openapi: {
        info: {
          title: "Wafl Studio API",
          description: "와플스튜디오 2023 리액트 세미나 과제를 위한 백엔드. " +
            "2022 백엔드를 재탕했기 때문에 소스코드의 이름들이 살짝씩 엇나가 있는 것이 특징이다.",
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
    app.register(fastifyCors, {
      origin: true,
      allowedHeaders: "Authorization,Content-Type",
      credentials: true,
    }),
    app.register(fastifyFormbody),
    app.register(fastifySchedule),
    app.register(fastifyCookie),
    app.register(tokenPlugin),
    app.register(authRoutes, { prefix: "/auth" }),
    app.register(ownersRoutes, { prefix: "/users" }),
    app.register(menuRoutes, { prefix: "/snacks" }),
    app.register(reviewRoutes, { prefix: "/reviews" }),
  ]);

  app.addSchema(ownerSchema);
  app.addSchema(menuSchema);
  app.addSchema(reviewSchema);
  app.decorate("db", new PrismaClient());
  app.decorate("ownerModel", new OwnerModel(app.db));
  app.decorate("tokenModel", new RefreshTokenModel(app.db));
  app.decorate("menuModel", new MenuModel(app.db));
  app.decorate("reviewModel", new ReviewModel(app.db));
  app.decorate("authService", new AuthService(app.ownerModel, app.tokenModel));
  app.decorate("ownerService", new OwnerService(app.ownerModel));
  app.decorate("menuService", new MenuService(app.menuModel));
  app.decorate("reviewService", new ReviewService(app.reviewModel));

  await registry;

  await app.ready();

  app.scheduler.addIntervalJob(
    new SimpleIntervalJob(
      { days: 1 },
      new AsyncTask(
        "purge-tokens",
        async () => {
          await app.tokenModel.purge();
          app.log.info("successfully executed task purge-tokens");
        },
        (err) => {
          app.log.error(err, "cannot execute task purge-tokens");
        }
      )
    )
  );

  await app.listen({ port: 8080, host: "0.0.0.0" });
}

main().catch((reason) => {
  console.log(reason);
});
