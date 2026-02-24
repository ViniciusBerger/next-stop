import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PlaceRepository } from '../repository/place.repository';
import { Place } from '../schemas/place.schema';
import { CreatePlaceDTO } from '../DTOs/create.place.DTO';
import { UpdatePlaceDTO } from '../DTOs/update.place.DTO';
import { GetPlaceDTO } from '../DTOs/get.place.DTO';

@Injectable()
export class PlaceService {
  constructor(private readonly placeRepository: PlaceRepository) {}

  /**
   * Creates a new place
   * Checks for duplicate googlePlaceId before creating
   */
  async createPlace(dto: CreatePlaceDTO): Promise<Place> {
    // Check if place with this googlePlaceId already exists
    const existingPlace = await this.placeRepository.findOne({
      googlePlaceId: dto.googlePlaceId,
    });

    if (existingPlace) {
      throw new ConflictException(
        `Place with googlePlaceId ${dto.googlePlaceId} already exists`,
      );
    }

    return await this.placeRepository.create(dto as any); // ← CORRIGIDO
  }

  /**
   * Retrieves all places with optional filters
   */
  async getAllPlaces(dto?: GetPlaceDTO): Promise<Place[]> {
    if (!dto) {
      return await this.placeRepository.findMany({});
    }

    const filter: any = {};

    if (dto.googlePlaceId) {
      filter.googlePlaceId = dto.googlePlaceId;
    }
    if (dto.category) {
      filter.category = dto.category;
    }
    if (dto.name) {
      // Case-insensitive partial match
      filter.name = { $regex: dto.name, $options: 'i' };
    }

    return await this.placeRepository.findMany(filter);
  }

  /**
   * Retrieves a single place by ID or googlePlaceId
   */
  async getPlace(dto: GetPlaceDTO): Promise<Place> {
    const { id, googlePlaceId } = dto;
    const filter: any = {};

    if (id) filter._id = id;
    if (googlePlaceId) filter.googlePlaceId = googlePlaceId;

    const place = await this.placeRepository.findOne(filter);

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return place;
  }

  /**
   * Updates place data
   */
  async updatePlace(
    getDto: GetPlaceDTO,
    updateDto: UpdatePlaceDTO,
  ): Promise<Place> {
    const { id, googlePlaceId } = getDto;
    const filter: any = {};

    if (id) filter._id = id;
    if (googlePlaceId) filter.googlePlaceId = googlePlaceId;

    // Build update object
    const updateData: any = {};

    if (updateDto.description !== undefined) {
      updateData.description = updateDto.description;
    }
    if (updateDto.customImages !== undefined) {
      updateData.customImages = updateDto.customImages;
    }
    if (updateDto.customTags !== undefined) {
      updateData.customTags = updateDto.customTags;
    }
    if (updateDto.averageUserRating !== undefined) {
      updateData.averageUserRating = updateDto.averageUserRating;
    }
    if (updateDto.totalUserReviews !== undefined) {
      updateData.totalUserReviews = updateDto.totalUserReviews;
    }

    updateData.updatedAt = new Date();

    const updatedPlace = await this.placeRepository.update(
      filter,
      { $set: updateData }
    );

    if (!updatedPlace) {
      throw new NotFoundException('Place not found');
    }

    return updatedPlace;
  }

  /**
   * Deletes a place
   */
  async deletePlace(dto: GetPlaceDTO): Promise<{ deleted: boolean; message: string }> {
    const { id, googlePlaceId } = dto;
    const filter: any = {};

    if (id) filter._id = id;
    if (googlePlaceId) filter.googlePlaceId = googlePlaceId;

    const deletedPlace = await this.placeRepository.delete(filter);

    if (!deletedPlace) {
      throw new NotFoundException('Place not found');
    }

    return {
      deleted: true,
      message: `Place "${deletedPlace.name}" deleted successfully`,
    };
  }

  /**
   * Helper method to update place rating
   * Called when a review is added/updated/deleted
   */
  async updatePlaceRating(
    placeId: string,
    newRating: number,
    reviewCount: number
  ): Promise<void> {
    await this.placeRepository.update(
      { _id: placeId },
      {
        $set: {
          averageUserRating: newRating,
          totalUserReviews: reviewCount,
          updatedAt: new Date(),
        },
      }
    );
  }
}