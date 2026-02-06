import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GetOutingDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string; // MongoDB _id

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user?: string; // Filter by user ID

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  place?: string; // Filter by place ID
}