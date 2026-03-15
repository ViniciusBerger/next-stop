import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class FeedbackDto {

  @ApiProperty({ example: 1 })
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  recommendationId: number;

  @ApiProperty({ example: "like" })
  @IsString()
  feedback: string;

}