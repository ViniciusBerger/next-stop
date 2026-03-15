import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { PlaceService } from './place.service';
import { CreatePlaceDTO } from './DTOs/create.place.DTO';
import { UpdatePlaceDTO } from './DTOs/update.place.DTO';
import { GetPlaceDTO } from './DTOs/get.place.DTO';
import { plainToInstance } from 'class-transformer';
import { PlaceResponseDTO } from './DTOs/place.response.DTO';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Places')

@Controller('places')

export class PlaceController {

constructor(private readonly placeService: PlaceService) {}

// POST /places
@Post()

@ApiOperation({ summary: 'Create a new place' })

@ApiResponse({ status: 201, description: 'Place created successfully' })

async createPlace(@Body() createPlaceDTO: CreatePlaceDTO) {

const newPlace = await this.placeService.createPlace(createPlaceDTO);

return plainToInstance(PlaceResponseDTO, newPlace.toObject(), {
excludeExtraneousValues: true,
});

}

// GET /places
@Get()

@ApiOperation({ summary: 'Get all places' })

@ApiResponse({ status: 200, description: 'Places returned successfully' })

async getPlaces(@Query() getPlaceDTO?: GetPlaceDTO) {

const places = await this.placeService.getAllPlaces(getPlaceDTO);

return places.map((place) =>
plainToInstance(PlaceResponseDTO, place.toObject(), {
excludeExtraneousValues: true,
}),
);

}

// GET /places/details
@Get('details')

@ApiOperation({ summary: 'Get place details' })

@ApiResponse({ status: 200, description: 'Place details returned' })

async getPlace(@Query() getPlaceDTO: GetPlaceDTO) {

const hasIdentifier =
getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

if (!hasIdentifier) {
throw new BadRequestException('Please provide id or googlePlaceId');
}

const place = await this.placeService.getPlace(getPlaceDTO);

if (!place) {
throw new NotFoundException('Place not found');
}

return plainToInstance(PlaceResponseDTO, place.toObject(), {
excludeExtraneousValues: true,
});

}

// PUT /places
@Put()

@ApiOperation({ summary: 'Update a place' })

@ApiResponse({ status: 200, description: 'Place updated successfully' })

async updatePlace(@Query() getPlaceDTO: GetPlaceDTO, @Body() updatePlaceDTO: UpdatePlaceDTO) {

const hasIdentifier =
getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

if (!hasIdentifier) {
throw new BadRequestException('Please provide id or googlePlaceId');
}

const hasUpdateData = Object.keys(updatePlaceDTO).length > 0;

if (!hasUpdateData) {
throw new BadRequestException('Please provide data to update');
}

const updatedPlace = await this.placeService.updatePlace(getPlaceDTO, updatePlaceDTO);

if (!updatedPlace) {
throw new NotFoundException('Place not found');
}

return plainToInstance(PlaceResponseDTO, updatedPlace.toObject(), {
excludeExtraneousValues: true,
});

}

// DELETE /places
@Delete()

@ApiOperation({ summary: 'Delete a place' })

@ApiResponse({ status: 200, description: 'Place deleted successfully' })

async deletePlace(@Query() getPlaceDTO: GetPlaceDTO) {

const hasIdentifier =
getPlaceDTO.id !== undefined || getPlaceDTO.googlePlaceId !== undefined;

if (!hasIdentifier) {
throw new BadRequestException('Please provide id or googlePlaceId');
}

return await this.placeService.deletePlace(getPlaceDTO);

}

}