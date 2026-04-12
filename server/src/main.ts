import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const port = parseInt(process.env.APP_PORT || '8080', 10);
const rawHost = process.env.APP_HOST || '127.0.0.1';
const host =
  rawHost.trim().replace(/^['"]|['"]$/g, '') || '127.0.0.1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Chat Bot API')
    .setDescription('The Chat Bot API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port, host, () => {
    console.log(`Application is running on: http://${host}:${port}`);
  });
}
bootstrap();
