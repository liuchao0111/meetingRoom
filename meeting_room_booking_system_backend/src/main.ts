import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FormatResponseInterceptor } from './format-response.interceptor';
import { InvokeRecordInterceptor } from './invoke-record.interceptor';
// import { UnloginFilter } from './unlogin.filter';
import { CustomExceptionFilter } from './custom-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new FormatResponseInterceptor());
  app.useGlobalInterceptors(new InvokeRecordInterceptor());
  // app.useGlobalFilters(new UnloginFilter());
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  const config = new DocumentBuilder()
    .setTitle('会议室预定系统')
    .setDescription('api 接口文档')
    .setVersion('1.0')
    .build();
  const documnet = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-doc', app, documnet);
  const configService = app.get(ConfigService);
  await app.listen(process.env.PORT ?? configService.get('nest_server_port')!);
}
bootstrap();
