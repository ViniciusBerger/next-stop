import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OutingController } from './outing.controller';
import { OutingService } from './outing.service';
import { Outing, outingSchema } from './schema/outing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Outing.name, schema: outingSchema }]),
  ],
  controllers: [OutingController],
  providers: [OutingService],
  exports: [OutingService], // Export for use in other modules if needed
})
export class OutingModule {}