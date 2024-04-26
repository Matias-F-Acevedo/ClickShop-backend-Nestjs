import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true,
    forbidNonWhitelisted: true,}));
    // Al llamar app.enableCors(), estás permitiendo que tu aplicación NestJS responda a solicitudes de orígenes cruzados (cross-origin requests), lo que puede ser útil, por ejemplo, cuando estás construyendo una API que será consumida por aplicaciones frontend alojadas en diferentes dominios.
    app.enableCors();
    app.setGlobalPrefix('api')
  await app.listen(3000);
}
bootstrap();
