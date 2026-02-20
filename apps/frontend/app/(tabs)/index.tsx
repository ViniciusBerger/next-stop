import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import useGeolocation from '@/hooks/useGeolocation';
import { useState, useEffect } from 'react';

export default function HomeScreen() {
  const { location, loading, error, refreshLocation } = useGeolocation();
  const [nearbyCount, setNearbyCount] = useState<number>(0);

  // Calculate nearby places count based on location
  useEffect(() => {
    if (!location || loading) return;

    // Simulate nearby places calculation
    const dummyPlaces = [
      { id: '1', name: 'Place 1', latitude: location.latitude + 0.01, longitude: location.longitude + 0.01 },
      { id: '2', name: 'Place 2', latitude: location.latitude - 0.01, longitude: location.longitude - 0.01 },
      { id: '3', name: 'Place 3', latitude: location.latitude + 0.015, longitude: location.longitude - 0.005 },
    ];

    // Simple distance calculation
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const nearbyPlaces = dummyPlaces.filter(place => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        place.latitude,
        place.longitude
      );
      return distance <= 10; // 10km radius
    });

    setNearbyCount(nearbyPlaces.length);
  }, [location, loading]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* DISCOVER CARD SECTION - ADDED */}
      <ThemedView style={styles.discoverSection}>
        <ThemedText type="subtitle">Discover Nearby Places</ThemedText>
        
        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ThemedText>Getting your location...</ThemedText>
          </ThemedView>
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <ThemedText>Location Error: error</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={refreshLocation}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </ThemedView>
        ) : location ? (
          <ThemedView style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <ThemedText type="defaultSemiBold">📍 Your Current Location</ThemedText>
              {nearbyCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{nearbyCount}</Text>
                </View>
              )}
            </View>
            <ThemedText style={styles.coordinates}>
              Lat: {location.latitude.toFixed(6)}
              {'\n'}
              Lng: {location.longitude.toFixed(6)}
            </ThemedText>
            <ThemedText>
              {nearbyCount > 0 
                ? `Found ${nearbyCount} places nearby`
                : 'No nearby places found within 10km'}
            </ThemedText>
            
            <Link href="/discover" asChild>
              <TouchableOpacity style={styles.exploreButton}>
                <ThemedText type="defaultSemiBold" style={styles.exploreButtonText}>
                  Explore Discover Screen →
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </ThemedView>
        ) : (
          <ThemedView style={styles.noLocationContainer}>
            <ThemedText>Unable to retrieve location</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* ORIGINAL CONTENT (unchanged) */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  // NEW STYLES FOR DISCOVER SECTION
  discoverSection: {
    gap: 12,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(161, 206, 220, 0.2)',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  errorContainer: {
    padding: 12,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  locationCard: {
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  coordinates: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  noLocationContainer: {
    padding: 12,
    alignItems: 'center',
  },
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  exploreButtonText: {
    color: 'white',
  },
});