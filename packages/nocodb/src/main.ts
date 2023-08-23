import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import express from 'express';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  if (process.env.NC_WORKER_CONTAINER !== 'true') {
    app.use(
      express.json({ limit: process.env.NC_REQUEST_BODY_SIZE || '50mb' }),
    );
    app.use(
      cors({
        exposedHeaders: 'xc-db-response',
      }),
    );
    await app.listen(8080);
  } else {
    if (!process.env.NC_REDIS_URL) {
      throw new Error('NC_REDIS_URL is required');
    }
    process.env.NC_DISABLE_TELE = 'true';
    await app.init();
  }
}
bootstrap();
