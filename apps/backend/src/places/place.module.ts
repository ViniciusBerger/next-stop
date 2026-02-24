import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlaceController } from './controller/place.controller';
import { PlaceService } from './service/place.service';
import { PlaceRepository } from './repository/place.repository';
import { Place, placeSchema } from './schemas/place.schema';

/**
 * Place Module
 * Manages places (restaurants, pubs, parks, etc)
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: placeSchema }]),
  ],
  controllers: [PlaceController],
  providers: [PlaceService, PlaceRepository],
  exports: [PlaceService], // Export for use in Review, Event modules
})
export class PlaceModule {}