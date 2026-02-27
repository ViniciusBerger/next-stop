import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlaceRepository } from '../repository/place.repository';
import { Place } from '../schemas/place.schema';
import { CreatePlaceDTO } from '../DTOs/create.place.DTO';
import { UpdatePlaceDTO } from '../DTOs/update.place.DTO';
import { GetPlaceDTO } from '../DTOs/get.place.DTO';

@Injectable()
export class PlaceService {
  constructor(
    private readonly placeRepository: PlaceRepository,
    @InjectModel(Place.name) private readonly placeModel: Model<Place>
  ) {}

  /**
   * Creates a new place
   */
  async createPlace(dto: CreatePlaceDTO): Promise<Place> {
    const existingPlace = await this.placeRepository.findOne({
      googlePlaceId: dto.googlePlaceId,
    });

    if (existingPlace) {
      throw new ConflictException('Place with this Google Place ID already exists');
    }

    return await this.placeRepository.create(dto as any);
  }

  /**
   * Retrieves all places with optional filters
   */
  async getAllPlaces(dto?: GetPlaceDTO): Promise<Place[]> {
    // LOCATION FILTER (proximity)
    if (dto?.latitude && dto?.longitude) {
      const radiusMeters = dto.radiusMeters || 5000; // Default 5km

      const additionalFilters: any = {};
      if (dto.category) additionalFilters.category = dto.category;
      if (dto.maxPriceLevel !== undefined) {
        additionalFilters.priceLevel = { $lte: dto.maxPriceLevel };
      }

      return await this.placeRepository.findNearby(
        dto.latitude,
        dto.longitude,
        radiusMeters,
        additionalFilters
      );
    }

    // STANDARD FILTERS
    const filter: any = {};

    if (dto) {
      if (dto.googlePlaceId) filter.googlePlaceId = dto.googlePlaceId;
      if (dto.category) filter.category = dto.category;
      if (dto.name) filter.name = { $regex: dto.name, $options: 'i' };
      
      // PRICE FILTER
      if (dto.maxPriceLevel !== undefined) {
        filter.priceLevel = { $lte: dto.maxPriceLevel };
      }
    }

    return await this.placeRepository.findMany(filter);
  }

  /**
   * Retrieves a specific place
   */
  async getPlace(dto: GetPlaceDTO): Promise<Place> {
    let place: Place | null = null;

    if (dto.id) {
      place = await this.placeRepository.findById(dto.id);
    } else if (dto.googlePlaceId) {
      place = await this.placeRepository.findOne({ googlePlaceId: dto.googlePlaceId });
    }

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return place;
  }

  /**
   * Updates a place
   */
  async updatePlace(getDto: GetPlaceDTO, updateDto: UpdatePlaceDTO): Promise<Place> {
    const filter: any = {};

    if (getDto.id) filter._id = getDto.id;
    if (getDto.googlePlaceId) filter.googlePlaceId = getDto.googlePlaceId;

    const updateData: any = { ...updateDto, updatedAt: new Date() };

    const updatedPlace = await this.placeRepository.update(filter, { $set: updateData });

    if (!updatedPlace) {
      throw new NotFoundException('Place not found');
    }

    return updatedPlace;
  }

  /**
   * Deletes a place
   */
  async deletePlace(dto: GetPlaceDTO): Promise<{ deleted: boolean; message: string }> {
    const filter: any = {};

    if (dto.id) filter._id = dto.id;
    if (dto.googlePlaceId) filter.googlePlaceId = dto.googlePlaceId;

    const deletedPlace = await this.placeRepository.delete(filter);

    if (!deletedPlace) {
      throw new NotFoundException('Place not found');
    }

    return {
      deleted: true,
      message: `Place "${deletedPlace.name}" deleted successfully`,
    };
  }
}