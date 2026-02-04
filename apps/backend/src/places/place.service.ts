import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place } from './schemas/place.schema';
import { CreatePlaceDTO } from './DTOs/create.place.DTO';
import { UpdatePlaceDTO } from './DTOs/update.place.DTO';
import { GetPlaceDTO } from './DTOs/get.place.DTO';

@Injectable()
export class PlaceService {
  private placeModel: Model<Place>;

  constructor(@InjectModel(Place.name) placeModelReceived: Model<Place>) {
    this.placeModel = placeModelReceived;
  }

  // CREATE - Add a new place
  async createPlace(createPlaceDTO: CreatePlaceDTO): Promise<Place> {
    // Check if place with this googlePlaceId already exists
    const existingPlace = await this.placeModel
      .findOne({ googlePlaceId: createPlaceDTO.googlePlaceId })
      .exec();

    if (existingPlace) {
      throw new ConflictException(
        `Place with googlePlaceId ${createPlaceDTO.googlePlaceId} already exists`,
      );
    }

    const newPlace = new this.placeModel(createPlaceDTO);
    return await newPlace.save();
  }

  // GET ALL - List all places (with optional filters)
  async getAllPlaces(getPlaceDTO?: GetPlaceDTO): Promise<Place[]> {
    const mongoQuery: any = {};

    if (getPlaceDTO) {
      if (getPlaceDTO.googlePlaceId) {
        mongoQuery.googlePlaceId = getPlaceDTO.googlePlaceId;
      }
      if (getPlaceDTO.category) {
        mongoQuery.category = getPlaceDTO.category;
      }
      if (getPlaceDTO.name) {
        // Case-insensitive partial match
        mongoQuery.name = { $regex: getPlaceDTO.name, $options: 'i' };
      }
    }

    return await this.placeModel.find(mongoQuery).exec();
  }

  // GET ONE - Get place by ID or googlePlaceId
  async getPlace(getPlaceDTO: GetPlaceDTO): Promise<Place | null> {
    const { id, googlePlaceId } = getPlaceDTO;
    const mongoQuery: any = {};

    if (id) mongoQuery._id = id;
    if (googlePlaceId) mongoQuery.googlePlaceId = googlePlaceId;

    const place = await this.placeModel.findOne(mongoQuery).exec();

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return place;
  }

  // UPDATE - Update place data
  async updatePlace(
    getPlaceDTO: GetPlaceDTO,
    updatePlaceDTO: UpdatePlaceDTO,
  ): Promise<Place | null> {
    const { id, googlePlaceId } = getPlaceDTO;
    const mongoQuery: any = {};

    if (id) mongoQuery._id = id;
    if (googlePlaceId) mongoQuery.googlePlaceId = googlePlaceId;

    // Build update object
    const updateData: any = {};

    if (updatePlaceDTO.description !== undefined) {
      updateData.description = updatePlaceDTO.description;
    }
    if (updatePlaceDTO.customImages !== undefined) {
      updateData.customImages = updatePlaceDTO.customImages;
    }
    if (updatePlaceDTO.customTags !== undefined) {
      updateData.customTags = updatePlaceDTO.customTags;
    }
    if (updatePlaceDTO.averageUserRating !== undefined) {
      updateData.averageUserRating = updatePlaceDTO.averageUserRating;
    }
    if (updatePlaceDTO.totalUserReviews !== undefined) {
      updateData.totalUserReviews = updatePlaceDTO.totalUserReviews;
    }

    // Update updatedAt
    updateData.updatedAt = new Date();

    const updatedPlace = await this.placeModel
      .findOneAndUpdate(mongoQuery, { $set: updateData }, { new: true, runValidators: true })
      .exec();

    if (!updatedPlace) {
      throw new NotFoundException('Place not found');
    }

    return updatedPlace;
  }

  // DELETE - Remove a place
  async deletePlace(getPlaceDTO: GetPlaceDTO): Promise<{ deleted: boolean; message: string }> {
    const { id, googlePlaceId } = getPlaceDTO;
    const mongoQuery: any = {};

    if (id) mongoQuery._id = id;
    if (googlePlaceId) mongoQuery.googlePlaceId = googlePlaceId;

    const deletedPlace = await this.placeModel.findOneAndDelete(mongoQuery).exec();

    if (!deletedPlace) {
      throw new NotFoundException('Place not found');
    }

    return {
      deleted: true,
      message: `Place "${deletedPlace.name}" deleted successfully`,
    };
  }

  // HELPER - Update rating (called when a review is added/updated/deleted)
  async updatePlaceRating(placeId: string, newRating: number, reviewCount: number): Promise<void> {
    await this.placeModel
      .findByIdAndUpdate(
        placeId,
        {
          $set: {
            averageUserRating: newRating,
            totalUserReviews: reviewCount,
            updatedAt: new Date(),
          },
        },
        { new: true },
      )
      .exec();
  }
}