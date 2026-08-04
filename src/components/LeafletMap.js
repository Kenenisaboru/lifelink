import React, { useRef, useEffect, useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme/colors';

/**
 * LeafletMap — Interactive dark-mode map using Leaflet.js in a WebView.
 * Works in Expo Go without native map dependencies.
 *
 * Props:
 *   center: { lat, lng }
 *   zoom: number (default 13)
 *   markers: [{ id, lat, lng, type: 'hospital'|'donor', label, popup, pulseColor }]
 *   routeFrom: { lat, lng } (donor position)
 *   routeTo: { lat, lng }   (hospital position)
 *   etaText: string
 *   onMarkerPress: (markerId) => void
 */
export default function LeafletMap({
  center = { lat: -1.2921, lng: 36.8219 },
  zoom = 13,
  markers = [],
  routeFrom,
  routeTo,
  etaText,
  height = 360,
  style,
}) {
  const markersJSON = JSON.stringify(markers);
  const routeFromJSON = routeFrom ? JSON.stringify(routeFrom) : 'null';
  const routeToJSON = routeTo ? JSON.stringify(routeTo) : 'null';

  const html = useMemo(() => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0B0F17; overflow: hidden; }
    #map { width: 100%; height: 100vh; }

    .hospital-marker {
      background: rgba(255, 59, 92, 0.25);
      border: 2px solid #FF3B5C;
      border-radius: 50%;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
      animation: pulse 2s infinite;
    }
    .donor-marker {
      background: rgba(0, 230, 118, 0.3);
      border: 2px solid #00E676;
      border-radius: 50%;
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    }
    .eta-label {
      background: rgba(11, 15, 23, 0.85);
      border: 1px solid #00E5FF;
      color: #00E5FF;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      font-family: sans-serif;
      white-space: nowrap;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 92, 0.5); }
      50% { box-shadow: 0 0 0 12px rgba(255, 59, 92, 0); }
    }

    .leaflet-popup-content-wrapper {
      background: #161C28 !important;
      color: #F1F5F9 !important;
      border: 1px solid #2C3549 !important;
      border-radius: 12px !important;
      font-family: sans-serif;
    }
    .leaflet-popup-tip { background: #161C28 !important; }
    .leaflet-popup-content { font-size: 13px !important; line-height: 1.5; }
    .popup-title { font-weight: 800; font-size: 14px; color: #F1F5F9; }
    .popup-sub { color: #94A3B8; font-size: 12px; margin-top: 2px; }
    .popup-badge { display: inline-block; background: rgba(255,59,92,0.2); color: #FF3B5C;
      padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; margin-top: 4px; }

    .leaflet-control-zoom a {
      background: #161C28 !important; color: #F1F5F9 !important;
      border-color: #2C3549 !important;
    }
  </style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [${center.lat}, ${center.lng}],
    zoom: ${zoom},
    zoomControl: true,
    attributionControl: false
  });

  // Dark tile layer (CartoDB Dark Matter)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Render markers
  var markers = ${markersJSON};
  markers.forEach(function(m) {
    var iconClass = m.type === 'hospital' ? 'hospital-marker' : 'donor-marker';
    var emoji = m.type === 'hospital' ? '🏥' : '🙋';
    var icon = L.divIcon({
      html: '<div class="' + iconClass + '">' + emoji + '</div>',
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18]
    });

    var marker = L.marker([m.lat, m.lng], { icon: icon }).addTo(map);
    if (m.popup) {
      marker.bindPopup(m.popup);
    }
    if (m.label) {
      marker.bindTooltip(m.label, { permanent: false, direction: 'top', className: 'eta-label' });
    }
  });

  // Route line from donor to hospital
  var routeFrom = ${routeFromJSON};
  var routeTo = ${routeToJSON};
  if (routeFrom && routeTo) {
    var routeLine = L.polyline(
      [[routeFrom.lat, routeFrom.lng], [routeTo.lat, routeTo.lng]],
      { color: '#00E5FF', weight: 3, opacity: 0.7, dashArray: '8, 6' }
    ).addTo(map);

    // ETA label at midpoint
    var midLat = (routeFrom.lat + routeTo.lat) / 2;
    var midLng = (routeFrom.lng + routeTo.lng) / 2;
    var etaText = '${etaText || ''}';
    if (etaText) {
      var etaIcon = L.divIcon({
        html: '<div class="eta-label">🕐 ' + etaText + '</div>',
        className: '',
        iconSize: [120, 28],
        iconAnchor: [60, 14]
      });
      L.marker([midLat, midLng], { icon: etaIcon, interactive: false }).addTo(map);
    }

    // Fit bounds to show both points
    map.fitBounds([[routeFrom.lat, routeFrom.lng], [routeTo.lat, routeTo.lng]], { padding: [50, 50] });
  }
</script>
</body>
</html>
  `, [markersJSON, center.lat, center.lng, zoom, routeFromJSON, routeToJSON, etaText]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }, style]}>
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Leaflet Map"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
