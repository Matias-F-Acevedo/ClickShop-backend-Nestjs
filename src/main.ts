import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle("ClickShop API")
    .setDescription("La API de ClickShop Backend es el núcleo del proyecto de e-commerce ClickShop, encargada de manejar toda la lógica del negocio y la comunicación con la base de datos. Esta API está desarrollada utilizando NestJS, un potente framework de Node.js diseñado para construir aplicaciones del lado del servidor de manera escalable y eficiente.")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("doc", app, document);

  await app.listen(parseInt(process.env.PORT) || 3000);
}

bootstrap();