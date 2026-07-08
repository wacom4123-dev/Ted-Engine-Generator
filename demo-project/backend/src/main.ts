
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import csurf from 'csurf';
import { logger } from './common/logger';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(helmet());
  app.use(compression());
  app.use(csurf());
  
  
  app.use((morgan as any)('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
  

  
  
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const { TransformInterceptor } = await import('./common/interceptors/transform.interceptor');
  const { HttpExceptionFilter } = await import('./common/filters/http-exception.filter');
  
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Advanced Demo App API')
    .setDescription('A full-stack project with advanced features like JWT, RBAC, GraphQL, and WebSockets.')
    .setVersion('1.0')
    
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  

  const port = process.env.PORT || 4000;
  
  app.enableShutdownHooks();
  
  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on: http://localhost:${port}`);
}
bootstrap();
  