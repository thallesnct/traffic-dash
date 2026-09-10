import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

const DEFAULT_PORT = 3333;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? "http://localhost:5174")
      .split(",")
      .map((origin) => origin.trim()),
    exposedHeaders: ["X-Cache"],
  });

  await app.listen(process.env.API_PORT ?? DEFAULT_PORT);
}

void bootstrap();
