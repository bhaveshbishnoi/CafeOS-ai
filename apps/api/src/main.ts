import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend integration
  app.enableCors();
  
  // Set global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`NestJS application successfully listening on port ${port}`);
}
bootstrap();
