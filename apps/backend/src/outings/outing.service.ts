import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Outing } from './schema/outing.schema';
import { CreateOutingDTO } from './DTOs/create.outing.DTO';
import { GetOutingDTO } from './DTOs/get.outing.DTO';
import { LikeOutingDTO } from './DTOs/like.outing.DTO';

@Injectable()
export class OutingService {
  private outingModel: Model<Outing>;

  constructor(@InjectModel(Outing.name) outingModelReceived: Model<Outing>) {
    this.outingModel = outingModelReceived;
  }

  // CREATE - Add a new outing (post/check-in)
  async createOuting(createOutingDTO: CreateOutingDTO): Promise<Outing> {
    const newOuting = new this.outingModel(createOutingDTO);
    return await newOuting.save();
  }

  // GET ALL - Get feed (all outings, most recent first)
  async getFeed(getOutingDTO?: GetOutingDTO): Promise<Outing[]> {
    const mongoQuery: any = {};

    if (getOutingDTO) {
      if (getOutingDTO.user) mongoQuery.user = getOutingDTO.user;
      if (getOutingDTO.place) mongoQuery.place = getOutingDTO.place;
    }

    return await this.outingModel
      .find(mongoQuery)
      .populate('user', 'username profilePicture') // Populate user details
      .populate('place', 'name address category') // Populate place details
      .populate('likedBy', 'username profilePicture') // Populate who liked
      .sort({ createdAt: -1 }) // Most recent first
      .exec();
  }

  // GET ONE - Get a specific outing by ID
  async getOuting(getOutingDTO: GetOutingDTO): Promise<Outing | null> {
    const { id } = getOutingDTO;

    if (!id) {
      throw new BadRequestException('Please provide an outing ID');
    }

    const outing = await this.outingModel
      .findById(id)
      .populate('user', 'username profilePicture')
      .populate('place', 'name address category')
      .populate('likedBy', 'username profilePicture')
      .exec();

    if (!outing) {
      throw new NotFoundException('Outing not found');
    }

    return outing;
  }

  // GET USER HISTORY - Get all outings by a specific user
  async getUserHistory(userId: string): Promise<Outing[]> {
    return await this.outingModel
      .find({ user: userId })
      .populate('place', 'name address category customImages')
      .sort({ date: -1 }) // Most recent first
      .exec();
  }

  // DELETE - Remove an outing
  async deleteOuting(outingId: string): Promise<{ deleted: boolean; message: string }> {
    const deletedOuting = await this.outingModel.findByIdAndDelete(outingId).exec();

    if (!deletedOuting) {
      throw new NotFoundException('Outing not found');
    }

    return {
      deleted: true,
      message: `Outing deleted successfully`,
    };
  }

  // LIKE - Toggle like on an outing
  async toggleLike(likeOutingDTO: LikeOutingDTO): Promise<Outing> {
    const { outingId, userId } = likeOutingDTO;

    const outing = await this.outingModel.findById(outingId).exec();

    if (!outing) {
      throw new NotFoundException('Outing not found');
    }

    // Check if user already liked this outing
    const userIndex = outing.likedBy.findIndex(
      (id) => id.toString() === userId.toString(),
    );

    if (userIndex > -1) {
      // User already liked - UNLIKE
      outing.likedBy.splice(userIndex, 1);
      outing.likes = Math.max(0, outing.likes - 1);
    } else {
      // User hasn't liked - LIKE
      outing.likedBy.push(userId as any);
      outing.likes += 1;
    }

    return await outing.save();
  }

  // HELPER - Get outings for a specific place
  async getOutingsForPlace(placeId: string): Promise<Outing[]> {
    return await this.outingModel
      .find({ place: placeId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .exec();
  }
}