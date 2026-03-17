import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GetReviewDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string; // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string; // Filter by author

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  place?: string; // Filter by place

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  event?: string; // Filter by event
}