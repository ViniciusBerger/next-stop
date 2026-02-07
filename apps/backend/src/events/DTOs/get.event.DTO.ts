import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export enum EventStatus {
  UPCOMING = 'upcoming',
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
}