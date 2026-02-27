import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Place } from "../schemas/place.schema";
import { IplaceData } from "./Iplace.data";

@Injectable()
export class PlaceRepository {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>
  ) {}

  async create(data: Partial<Place>): Promise<Place> {
    return await new this.placeModel(data).save();
  }

  async findOne(filter: IplaceData): Promise<Place | null> {
    return await this.placeModel.findOne(filter).exec();
  }

  async findMany(filter: IplaceData): Promise<Place[]> {
    return await this.placeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Place | null> {
    return await this.placeModel.findById(id).exec();
  }

  async findNearby( // finds places by proximity
    latitude: number,
    longitude: number,
    radiusMeters: number,
    additionalFilters?: IplaceData
  ): Promise<Place[]> {
    const query: any = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude], // [lng, lat]
          },
          $maxDistance: radiusMeters,
        },
      },
      ...additionalFilters,
    };

    return await this.placeModel.find(query).exec();
  }

  async update(
    filter: IplaceData,
    update: UpdateQuery<Place>
  ): Promise<Place | null> {
    return await this.placeModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  async delete(filter: IplaceData): Promise<Place | null> {
    return await this.placeModel.findOneAndDelete(filter).exec();
  }
}