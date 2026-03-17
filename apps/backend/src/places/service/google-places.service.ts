import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, PlaceInputType } from '@googlemaps/google-maps-services-js';

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private client: Client;
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.client = new Client({});
    this.apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.warn('Google Places API Key not configured');
    }
  }

  /**
   * Search places by text query
   * @param query - Search text (e.g., "coffee shops in Vancouver")
   * @param location - Optional: Center point {lat, lng}
   * @param radius - Optional: Search radius in meters (default: 5000)
   */
  async searchPlaces(query: string, location?: { lat: number; lng: number }, radius: number = 5000) {
    try {
      const params: any = {
        query,
        key: this.apiKey,
      };

      // Add location bias if provided
      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = radius;
      }

      const response = await this.client.textSearch({ params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      return response.data.results.map(place => this.formatPlace(place));
    } catch (error) {
      this.logger.error('Error searching places', error);
      throw error;
    }
  }

  /**
   * Search nearby places by category
   * @param location - Center point {lat, lng}
   * @param type - Place type (restaurant, cafe, bar, etc)
   * @param radius - Search radius in meters (default: 5000)
   */
  async searchNearby(
    location: { lat: number; lng: number },
    type?: string,
    radius: number = 5000,
  ) {
    try {
      const params: any = {
        location: `${location.lat},${location.lng}`,
        radius,
        key: this.apiKey,
      };

      if (type) {
        params.type = type;
      }

      const response = await this.client.placesNearby({ params });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      return response.data.results.map(place => this.formatPlace(place));
    } catch (error) {
      this.logger.error('Error searching nearby places', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a place
   * @param placeId - Google Place ID
   */
  async getPlaceDetails(placeId: string) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'types',
            'rating',
            'user_ratings_total',
            'price_level',
            'opening_hours',
            'photos',
            'formatted_phone_number',
            'website',
          ],
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return null;
      }

      return this.formatPlace(response.data.result);
    } catch (error) {
      this.logger.error('Error getting place details', error);
      throw error;
    }
  }

  /**
   * Geocode an address to coordinates
   * @param address - Address string
   */
  async geocodeAddress(address: string) {
    try {
      const response = await this.client.geocode({
        params: {
          address,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        this.logger.error(`Geocoding API error: ${response.data.status}`);
        return null;
      }

      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    } catch (error) {
      this.logger.error('Error geocoding address', error);
      throw error;
    }
  }

  /**
   * Format Google Place data to our schema
   */
  private formatPlace(place: any) {
    const formatted: any = {
      googlePlaceId: place.place_id,
      name: place.name,
      address: place.formatted_address || place.vicinity,
      category: this.mapGoogleTypeToCategory(place.types),
    };

    // Add location if available
    if (place.geometry?.location) {
      formatted.location = {
        type: 'Point',
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat,
        ],
      };
    }

    // Add optional fields
    if (place.price_level !== undefined) {
      formatted.priceLevel = place.price_level;
    }

    if (place.rating) {
      formatted.googleRating = place.rating;
    }

    if (place.user_ratings_total) {
      formatted.googleReviewCount = place.user_ratings_total;
    }

    if (place.photos && place.photos.length > 0) {
      formatted.googlePhotos = place.photos.map(photo => photo.photo_reference);
    }

    if (place.opening_hours) {
      formatted.openingHours = place.opening_hours;
    }

    if (place.formatted_phone_number) {
      formatted.phoneNumber = place.formatted_phone_number;
    }

    if (place.website) {
      formatted.website = place.website;
    }

    return formatted;
  }

  /**
   * Map Google Place types to our category system
   */
  private mapGoogleTypeToCategory(types: string[]): string {
    if (!types || types.length === 0) return 'Other';

    const typeMapping = {
      restaurant: 'Restaurant',
      cafe: 'Cafe',
      bar: 'Bar',
      night_club: 'Nightclub',
      park: 'Park',
      museum: 'Museum',
      art_gallery: 'Art Gallery',
      shopping_mall: 'Shopping',
      gym: 'Gym',
      spa: 'Spa',
      movie_theater: 'Cinema',
      library: 'Library',
      church: 'Religious Site',
      tourist_attraction: 'Tourist Attraction',
    };

    // Find first matching type
    for (const type of types) {
      if (typeMapping[type]) {
        return typeMapping[type];
      }
    }

    // Default to first type if no match
    return types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get photo URL from photo reference
   * @param photoReference - Google photo reference
   * @param maxWidth - Maximum width in pixels (default: 400)
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${this.apiKey}`;
  }
}