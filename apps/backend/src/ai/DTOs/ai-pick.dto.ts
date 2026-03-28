import { IsString, IsArray, IsNotEmpty, ValidateNested, ArrayMinSize, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CompactPlaceDto {
  @IsString() @IsNotEmpty() id: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() category: string;
}

export class AiPickDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Keep your vibe description under 200 characters!' }) 
  vibe: string;

  @IsString() 
  @IsOptional() 
  userId?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'The AI needs at least one place to choose from!' }) // Prevents empty lists
  @ValidateNested({ each: true })
  @Type(() => CompactPlaceDto)
  places: CompactPlaceDto[];
}