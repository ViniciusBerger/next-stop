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
import { PlaceService } from '../service/place.service';
import { CreatePlaceDTO } from '../DTOs/create.place.DTO';
import { UpdatePlaceDTO } from '../DTOs/update.place.DTO';
import { GetPlaceDTO } from '../DTOs/get.place.DTO';
import { plainToInstance } from 'class-transformer';
import { PlaceResponseDTO } from '../DTOs/place.response.DTO';

@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  /**
   * Creates a new place
   * POST /places
   */
  @Post()
  async createPlace(@Body() createPlaceDTO: CreatePlaceDTO) {
    const newPlace = await this.placeService.createPlace(createPlaceDTO);

    return plainToInstance(PlaceResponseDTO, newPlace.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Retrieves all places with optional filters
   * GET /places?googlePlaceId=xxx or /places?category=Restaurant
   */
  @Get()
  async getPlaces(@Query() getPlaceDTO?: GetPlaceDTO) {
    const places = await this.placeService.getAllPlaces(getPlaceDTO);

    return places.map((place) =>
      plainToInstance(PlaceResponseDTO, place.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  /**
   * Retrieves a specific place
   * GET /places/details?id=xxx or /places/details?googlePlaceId=xxx
   */
  @Get('details')
  async getPlace(@Query() getPlaceDTO: GetPlaceDTO) {
    // Validate that at least one parameter was provided
    const hasParams = getPlaceDTO.id || getPlaceDTO.googlePlaceId;

    if (!hasParams) {
      throw new BadRequestException(
        'Please provide either id or googlePlaceId',
      );
    }

    const place = await this.placeService.getPlace(getPlaceDTO);

    return plainToInstance(PlaceResponseDTO, place.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Updates a place
   * PUT /places?id=xxx or /places?googlePlaceId=xxx
   */
  @Put()
  async updatePlace(
    @Query() getPlaceDTO: GetPlaceDTO,
    @Body() updatePlaceDTO: UpdatePlaceDTO,
  ) {
    const hasParams = getPlaceDTO.id || getPlaceDTO.googlePlaceId;

    if (!hasParams) {
      throw new BadRequestException(
        'Please provide either id or googlePlaceId',
      );
    }

    const updatedPlace = await this.placeService.updatePlace(
      getPlaceDTO,
      updatePlaceDTO,
    );

    return plainToInstance(PlaceResponseDTO, updatedPlace.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Deletes a place
   * DELETE /places?id=xxx or /places?googlePlaceId=xxx
   */
  @Delete()
  async deletePlace(@Query() getPlaceDTO: GetPlaceDTO) {
    const hasParams = getPlaceDTO.id || getPlaceDTO.googlePlaceId;

    if (!hasParams) {
      throw new BadRequestException(
        'Please provide either id or googlePlaceId',
      );
    }

    return await this.placeService.deletePlace(getPlaceDTO);
  }
}