import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  PAST = 'past',
  CANCELLED = 'cancelled'
}

export class GetEventDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string; // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  host?: string; // Filter by host

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  place?: string; // Filter by place

  @IsOptional()
  @IsEnum(EventStatus)
  status?: string; // Filter by status

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  privacy?: string; // "Public Event", "Friends Only", "Private Event"

}