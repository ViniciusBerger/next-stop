import { Controller, Get, Post, Put, Delete, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { PlaceService } from '../service/place.service';
import { GooglePlacesService } from '../service/google-places.service';
import { Place } from '../schemas/place.schema';
import { CreatePlaceDTO } from '../DTOs/create.place.DTO';
import { UpdatePlaceDTO } from '../DTOs/update.place.DTO';
import { GetPlaceDTO } from '../DTOs/get.place.DTO';
import { SearchPlacesDTO, SearchNearbyDTO, GeocodeDTO } from '../DTOs/search-places.DTO';

@Controller('places')
export class PlaceController {
  constructor(
    private readonly placeService: PlaceService,
    private readonly googlePlacesService: GooglePlacesService,
  ) {}

  @Post()
  async createPlace(@Body() dto: CreatePlaceDTO) {
    return await this.placeService.createPlace(dto);
  }

  @Get()
  async getAllPlaces(@Query() dto?: GetPlaceDTO) {
    return await this.placeService.getAllPlaces(dto);
  }

  @Get('details')
  async getPlace(@Query() dto: GetPlaceDTO) {
    return await this.placeService.getPlace(dto);
  }

  @Put()
  async updatePlace(@Body() dto: UpdatePlaceDTO) {
    return await this.placeService.updatePlace(dto);
  }

  @Delete()
  async deletePlace(@Query('googlePlaceId') googlePlaceId: string) {
    if (!googlePlaceId) {
      throw new BadRequestException('googlePlaceId is required');
    }
    return await this.placeService.deletePlace(googlePlaceId);
  }

  @Get('search')
  async searchPlaces(@Query() dto: SearchPlacesDTO) {
    const location = dto.latitude && dto.longitude
      ? { lat: dto.latitude, lng: dto.longitude }
      : undefined;

    const googleResults = await this.googlePlacesService.searchPlaces(
      dto.query,
      location,
      dto.radius,
    );

    const savedPlaces: Place[] = []; // ← ADICIONAR TIPO
    for (const result of googleResults) {
      const existing = await this.placeService.getPlace({ googlePlaceId: result.googlePlaceId });

      if (!existing) {
        const saved = await this.placeService.createPlace(result);
        savedPlaces.push(saved);
      } else {
        savedPlaces.push(existing);
      }
    }

    return savedPlaces;
  }

  @Get('nearby')
  async searchNearby(@Query() dto: SearchNearbyDTO) {
    const location = { lat: dto.latitude, lng: dto.longitude };
    const radius = dto.radius ?? 10000;

    // Prevents API overuse for now
    const cached = await this.placeService.searchNearby(dto.latitude, dto.longitude, radius);
    if (cached.length > 10) {
      return cached;
    }

    // General call + targeted calls for categories that get buried
    const [general, cinemas, parks, museums, gyms] = await Promise.all([
      this.googlePlacesService.searchNearby(location, undefined, radius),
      this.googlePlacesService.searchNearby(location, 'movie_theater', radius),
      this.googlePlacesService.searchNearby(location, 'park', radius),
      this.googlePlacesService.searchNearby(location, 'museum', radius),
      this.googlePlacesService.searchNearby(location, 'gym', radius),
    ]);

    // Deduplicate by googlePlaceId
    const seen = new Set<string>();
    const allResults = [...general, ...cinemas, ...parks, ...museums, ...gyms]
      .filter(place => {
        if (seen.has(place.googlePlaceId)) return false;
        seen.add(place.googlePlaceId);
        return true;
      });

    // Save only NEW places to MongoDB
    for (const result of allResults) {
      const exists = await this.placeService.getPlace({ googlePlaceId: result.googlePlaceId });
      if (!exists) {
        await this.placeService.createPlace(result);
      }
    }

    return await this.placeService.searchNearby(dto.latitude, dto.longitude, radius);
  }

  @Get('google/:placeId')
  async getGooglePlaceDetails(@Param('placeId') placeId: string) {
    const details = await this.googlePlacesService.getPlaceDetails(placeId);

    if (!details) {
      throw new BadRequestException('Place not found');
    }

    const existing = await this.placeService.getPlace({ googlePlaceId: placeId });

    if (!existing) {
      return await this.placeService.createPlace(details);
    }

    return existing;
  }

  @Get('geocode')
  async geocodeAddress(@Query() dto: GeocodeDTO) {
    return await this.googlePlacesService.geocodeAddress(dto.address);
  }

  @Get('photo/:photoReference')
  getPhotoUrl(@Param('photoReference') photoReference: string, @Query('maxWidth') maxWidth?: number) {
    const width = maxWidth ? parseInt(maxWidth as any) : 400;
    return {
      url: this.googlePlacesService.getPhotoUrl(photoReference, width),
    };
  }
}