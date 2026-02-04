import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaceController } from './place.controller';
import { PlaceService } from './place.service';
import { Place, placeSchema } from './schemas/place.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: placeSchema }]),
  ],
  controllers: [PlaceController],
  providers: [PlaceService],
  exports: [PlaceService], // Export for use in other modules (e.g., Review, Event)
})
export class PlaceModule {}