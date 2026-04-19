import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Bật CORS để cho phép Frontend gọi API
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();

