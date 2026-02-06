import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Query,
  Param,
} from '@nestjs/common';
import { OutingService } from './outing.service';
import { CreateOutingDTO } from './DTOs/create.outing.DTO';
import { GetOutingDTO } from './DTOs/get.outing.DTO';
import { LikeOutingDTO } from './DTOs/like.outing.DTO';
import { plainToInstance } from 'class-transformer';
import { OutingResponseDTO } from './DTOs/outing.response.DTO';

@Controller('outings')
export class OutingController {
  constructor(private readonly outingService: OutingService) {}

  // POST /outings - Create a new outing (post/check-in)
  @Post()
  async createOuting(@Body() createOutingDTO: CreateOutingDTO) {
    const newOuting = await this.outingService.createOuting(createOutingDTO);

    return plainToInstance(OutingResponseDTO, newOuting.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /outings - Get feed (all outings, with optional filters)
  @Get()
  async getFeed(@Query() getOutingDTO?: GetOutingDTO) {
    const outings = await this.outingService.getFeed(getOutingDTO);

    return outings.map((outing) =>
      plainToInstance(OutingResponseDTO, outing.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // GET /outings/details - Get a specific outing by ID
  @Get('details')
  async getOuting(@Query() getOutingDTO: GetOutingDTO) {
    if (!getOutingDTO.id) {
      throw new BadRequestException('Please provide an outing ID');
    }

    const outing = await this.outingService.getOuting(getOutingDTO);

    if (!outing) {
      throw new NotFoundException('Outing not found');
    }

    return plainToInstance(OutingResponseDTO, outing.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /outings/user/:userId - Get user's history (all outings by user)
  @Get('user/:userId')
  async getUserHistory(@Param('userId') userId: string) {
    const outings = await this.outingService.getUserHistory(userId);

    return outings.map((outing) =>
      plainToInstance(OutingResponseDTO, outing.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }

  // DELETE /outings/:id - Delete an outing
  @Delete(':id')
  async deleteOuting(@Param('id') id: string) {
    return await this.outingService.deleteOuting(id);
  }

  // POST /outings/like - Toggle like on an outing
  @Post('like')
  async toggleLike(@Body() likeOutingDTO: LikeOutingDTO) {
    const updatedOuting = await this.outingService.toggleLike(likeOutingDTO);

    return plainToInstance(OutingResponseDTO, updatedOuting.toObject(), {
      excludeExtraneousValues: true,
    });
  }

  // GET /outings/place/:placeId - Get all outings for a specific place
  @Get('place/:placeId')
  async getOutingsForPlace(@Param('placeId') placeId: string) {
    const outings = await this.outingService.getOutingsForPlace(placeId);

    return outings.map((outing) =>
      plainToInstance(OutingResponseDTO, outing.toObject(), {
        excludeExtraneousValues: true,
      }),
    );
  }
}