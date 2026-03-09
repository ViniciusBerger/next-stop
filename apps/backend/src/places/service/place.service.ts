import { Injectable, NotFoundException } from '@nestjs/common';
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
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
  ) {}

  /**
   * Creates a new place or returns existing one
   */
  async createPlace(dto: CreatePlaceDTO): Promise<Place> {
    // Check if place already exists
    if (dto.googlePlaceId) {
      const existing = await this.placeRepository.findOne({ googlePlaceId: dto.googlePlaceId });
      if (existing) {
        return existing;
      }
    }

    const newPlace = await this.placeRepository.create(dto as any);
    return newPlace;
  }

  /**
   * Retrieves all places with optional filters
   */
  async getAllPlaces(dto?: GetPlaceDTO): Promise<Place[]> {
    const filter: any = {};

    if (dto) {
      if (dto.category) filter.category = dto.category;
      if (dto.priceLevel !== undefined) filter.priceLevel = dto.priceLevel;
      if (dto.googlePlaceId) filter.googlePlaceId = dto.googlePlaceId;
    }

    return await this.placeRepository.findMany(filter);
  }

  /**
   * Retrieves a specific place
   */
  async getPlace(dto: GetPlaceDTO): Promise<Place | null> {
    const filter: any = {};

    if (dto.googlePlaceId) {
      filter.googlePlaceId = dto.googlePlaceId;
    } else if (dto._id) {
      filter._id = dto._id;
    }

    return await this.placeRepository.findOne(filter);
  }

  /**
   * Updates a place
   */
  async updatePlace(dto: UpdatePlaceDTO): Promise<Place> {
    const filter: any = {};

    if (dto.googlePlaceId) {
      filter.googlePlaceId = dto.googlePlaceId;
    } else if (dto._id) {
      filter._id = dto._id;
    } else {
      throw new NotFoundException('Place identifier required');
    }

    const place = await this.placeRepository.findOne(filter);
    if (!place) {
      throw new NotFoundException('Place not found');
    }

    // Remove identifier fields from update
    const { googlePlaceId, _id, ...updateData } = dto;

    const updated = await this.placeRepository.update(filter, { $set: updateData });
    
    if (!updated) {
      throw new NotFoundException('Place not found');
    }

    return updated;
  }

  /**
   * Deletes a place
   */
  async deletePlace(googlePlaceId: string): Promise<{ deleted: boolean; message: string }> {
    const place = await this.placeRepository.findOne({ googlePlaceId });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    await this.placeRepository.delete({ googlePlaceId });

    return {
      deleted: true,
      message: `Place "${place.name}" deleted successfully`,
    };
  }

  /**
   * Search places near a location
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radius: number = 5000,
    category?: string,
  ): Promise<Place[]> {
    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    return await this.placeRepository.findNearby(latitude, longitude, radius, filter);
  }
}