import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDTO } from './DTOs/create.place.DTO';
import { UpdatePlaceDTO } from './DTOs/update.place.DTO';
import { GetPlaceDTO } from './DTOs/get.place.DTO';
import { plainToInstance } from 'class-transformer';
import { PlaceResponseDTO } from './DTOs/place.response.DTO';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  // POST /places - Create a new place
  @Post()
  async createPlace(@Body() createPlaceDTO: CreatePlaceDTO) {
    const newPlace = await this.placeService.createPlace(createPlaceDTO);

    return plainToInstance(PlaceResponseDTO, newPlace.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /places - Get all places (with optional filters)
  @Get()
  async getPlaces(@Query() getPlaceDTO?: GetPlaceDTO) {
    const places = await this.placeService.getAllPlaces(getPlaceDTO);

    return places.map((place) =>
      plainToInstance(PlaceResponseDTO, place.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // GET /places/details - Get a specific place by id or googlePlaceId
  @Get('details')
  async getPlace(@Query() getPlaceDTO: GetPlaceDTO) {
    // Validate that at least one parameter is provided
    const hasIdentifier =
      getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

    if (!hasIdentifier) {
      throw new BadRequestException('Please provide id or googlePlaceId');
    }

    const place = await this.placeService.getPlace(getPlaceDTO);

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return plainToInstance(PlaceResponseDTO, place.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // PUT /places - Update a place
  @Put()
  async updatePlace(@Query() getPlaceDTO: GetPlaceDTO, @Body() updatePlaceDTO: UpdatePlaceDTO) {
    // Validate identifier
    const hasIdentifier =
      getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

    if (!hasIdentifier) {
      throw new BadRequestException('Please provide id or googlePlaceId');
    }

    // Validate update data
    const hasUpdateData = Object.keys(updatePlaceDTO).length > 0;

    if (!hasUpdateData) {
      throw new BadRequestException('Please provide data to update');
    }

    const updatedPlace = await this.placeService.updatePlace(getPlaceDTO, updatePlaceDTO);

    if (!updatedPlace) {
      throw new NotFoundException('Place not found');
    }

    return plainToInstance(PlaceResponseDTO, updatedPlace.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // DELETE /places - Delete a place
  @Delete()
  async deletePlace(@Query() getPlaceDTO: GetPlaceDTO) {
    // Validate identifier
    const hasIdentifier =
      getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

    if (!hasIdentifier) {
      throw new BadRequestException('Please provide id or googlePlaceId');
    }

    return await this.placeService.deletePlace(getPlaceDTO);
  }
}