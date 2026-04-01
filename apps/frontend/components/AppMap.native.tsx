import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

interface Place {
  id: string;
  name: string;
  category?: string;
  type?: string;
  rating?: number;
  location: { type: string; coordinates: number[] };
}

interface Props {
  // Pass multiple places for discover-style multi-marker view
  places?: Place[];
  // Pass a single place to center and pin on that location (locationdetails)
  focusedPlace?: Place;
  userLocation?: { latitude: number; longitude: number } | null;
  onMarkerPress?: (place: Place) => void;
  style?: any;
}

function getCoords(place: Place): { latitude: number; longitude: number } | null {
  const coords = place.location?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords; // GeoJSON is [longitude, latitude]
  return { latitude: lat, longitude: lng };
}

export function AppMap({ places, focusedPlace, userLocation, onMarkerPress, style }: Props) {
  // Determine which location to center on
  const center = focusedPlace
    ? getCoords(focusedPlace)
    : userLocation ?? null;

  const initialRegion = center
    ? {
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: focusedPlace ? 0.01 : 0.05,
        longitudeDelta: focusedPlace ? 0.01 : 0.05,
      }
    : undefined;

  const markers = focusedPlace ? [focusedPlace] : (places ?? []);

  return (
    <MapView
      style={[styles.map, style]}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton={!focusedPlace}
    >
      {markers.map(place => {
        const coords = getCoords(place);
        if (!coords) return null;
        const label = place.category || place.type || '';

        return (
          <Marker key={place.id} coordinate={coords} pinColor="#7E9AFF">
            {onMarkerPress ? (
              <Callout onPress={() => onMarkerPress(place)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{place.name}</Text>
                  {label ? (
                    <Text style={styles.calloutCategory}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Text>
                  ) : null}
                  <Text style={styles.calloutAction}>Tap to view →</Text>
                </View>
              </Callout>
            ) : (
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{place.name}</Text>
                  {label ? (
                    <Text style={styles.calloutCategory}>
                      {label.charAt(0).toUpperCase() + label.slice(1)}
                    </Text>
                  ) : null}
                </View>
              </Callout>
            )}
          </Marker>
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  callout: {
    width: 170,
    padding: 8,
  },
  calloutName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  calloutCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  calloutAction: {
    fontSize: 12,
    color: '#7E9AFF',
    fontWeight: '600',
  },
});
