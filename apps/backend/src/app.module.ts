import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GlobalExceptionFilter } from './errors/global.error.filter';

@Module({
  imports: [

    // configuration module to inject environment variables, make sure to install @nestjs/config
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: '.env', // Looks into ./backend/.env
    }),
  ],


  controllers: [AppController],
  

  //providers are services that the module provides
  providers: [
    AppService, 
    {
      provide: `APP_FILTER`,
      useClass: GlobalExceptionFilter
    }
  ], 
})
export class AppModule {}
