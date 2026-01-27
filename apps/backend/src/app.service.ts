import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): any {
    return {
      message: "Hello world",
      status: 200
    };
  }

  getHealth(): any {
    return {
      message: "System is healthy",
      status: 200
    };
  }

  getFilteredPlaces(filters: {
    location?: string;
    type?: string;
    budget?: string;
  }) {
    try {
      const mockPlaces = [
        { id: 1, name: "Joe's Diner", location: "Toronto", type: "Restaurant", budget: "Medium" },
        { id: 2, name: "Central Park", location: "New York", type: "Park", budget: "Low" },
        { id: 3, name: "Starbucks", location: "Toronto", type: "Cafe", budget: "Medium" },
        { id: 4, name: "Luxury Hotel", location: "Vancouver", type: "Hotel", budget: "High" },
        { id: 5, name: "Pizza Palace", location: "Toronto", type: "Restaurant", budget: "Low" },
        { id: 6, name: "Art Museum", location: "Montreal", type: "Museum", budget: "Medium" },
        { id: 7, name: "Beach Resort", location: "Vancouver", type: "Resort", budget: "High" },
        { id: 8, name: "Tim Hortons", location: "Toronto", type: "Cafe", budget: "Low" },
      ];

      let filteredPlaces = [...mockPlaces];

      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        filteredPlaces = filteredPlaces.filter(place =>
          place.location.toLowerCase().includes(locationLower)
        );
      }

      if (filters.type) {
        filteredPlaces = filteredPlaces.filter(place =>
          place.type === filters.type
        );
      }

      if (filters.budget) {
        filteredPlaces = filteredPlaces.filter(place =>
          place.budget === filters.budget
        );
      }

      return {
        message: "Places retrieved successfully",
        status: 200,
        data: filteredPlaces,
        count: filteredPlaces.length,
        filtersApplied: {
          location: filters.location || 'None',
          type: filters.type || 'None',
          budget: filters.budget || 'None'
        }
      };
      
    } catch (error) {
      console.error('Error in getFilteredPlaces:', error);
      return {
        message: "Error fetching places",
        status: 500,
        data: [],
        error: error.message
      };
    }
  }
}