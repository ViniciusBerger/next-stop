import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config available everywhere without re-importing
      envFilePath: '.env', // Looks in apps/backend/.env
    }),
  ],
  controllers: [AppController],
  //services
  providers: [AppService], 
})
export class AppModule {}
