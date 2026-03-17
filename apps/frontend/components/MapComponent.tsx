import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface Marker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
}

interface Props {
  latitude: number;
  longitude: number;
  markers?: Marker[];
  onMarkerPress?: (id: string) => void;
  showsUserLocation?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  style?: any;
}

export default function MapComponent({
  latitude, longitude, markers = [], onMarkerPress,
  showsUserLocation = false, scrollEnabled = true,
  zoomEnabled = true, style
}: Props) {

  const markersJson = JSON.stringify(markers);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; }
        #map { width: 100vw; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function initMap() {
          const map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: ${latitude}, lng: ${longitude} },
            zoom: 14,
            gestureHandling: '${scrollEnabled ? 'auto' : 'none'}',
            zoomControl: ${zoomEnabled},
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          });

          ${showsUserLocation ? `
          new google.maps.Marker({
            position: { lat: ${latitude}, lng: ${longitude} },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            title: 'Your location',
          });
          ` : ''}

          const markers = ${markersJson};
          markers.forEach(function(marker) {
            const m = new google.maps.Marker({
              position: { lat: marker.lat, lng: marker.lng },
              map: map,
              title: marker.title,
            });
            m.addListener('click', function() {
              window.ReactNativeWebView.postMessage(marker.id);
            });
          });
        }
      </script>
      <script
        src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap"
        async defer>
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onMessage={(event) => onMarkerPress?.(event.nativeEvent.data)}
        scrollEnabled={false}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  webview: {
    flex: 1,
  },
});