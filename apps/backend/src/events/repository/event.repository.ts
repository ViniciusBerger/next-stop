import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Event } from "../schema/event.schema";
import { IeventData } from "./Ievent.data";

@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  async create(data: Partial<Event>): Promise<Event> {
    return await new this.eventModel(data).save();
  }

  async findOne(filter: IeventData): Promise<Event | null> {
    return await this.eventModel.findOne(filter).exec();
  }

  async findMany(filter: IeventData): Promise<Event[]> {
    return await this.eventModel
      .find(filter)
      .sort({ date: 1 })
      .exec();
  }

  async findById(id: string): Promise<Event | null> {
    return await this.eventModel.findById(id).exec();
  }

  async update(
    filter: IeventData,
    update: UpdateQuery<Event>
  ): Promise<Event | null> {
    return await this.eventModel
      .findOneAndUpdate(filter, update, { new: true, runValidators: true })
      .exec();
  }

  async delete(filter: IeventData): Promise<Event | null> {
    return await this.eventModel.findOneAndDelete(filter).exec();
  }

  async save(event: Event): Promise<Event> {
    return await event.save();
  }
}