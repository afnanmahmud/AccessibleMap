import React, { useCallback, useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import { fromLonLat } from 'ol/proj';
import { Icon, Style, Stroke } from 'ol/style';
import { defaults as defaultControls } from 'ol/control';
import Openrouteservice from 'openrouteservice-js';
import MapSearch from './MapSearch/MapSearch';
import 'ol/ol.css';
import './AccessibleMap.css';
import locationsData from './campuslocations.json';

// OpenRouteService API configuration
const orsDirections = new Openrouteservice.Directions({
  api_key: '5b3ce3597851110001cf6248a1d686e75cef4e86a9782464ccdb71cf',
});

// Types
export interface AccessibleMapProps {
  className?: string;
}

export interface Location {
  name: string;
  coordinates: [number, number];
}

interface TurnByTurnDirection {
  type: string;
  instruction: string;
  distance: number;
  duration: number;
}

interface RouteOption {
  steps: any;
  id: number;
  summary: string;
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: number[][];
}

// Constants
const INITIAL_CENTER = fromLonLat([-84.5831, 34.0390]);

// Load campus locations from JSON file
const campusLocations: Location[] = locationsData.locations.map(loc => ({
  name: loc.name,
  coordinates: loc.coordinates as [number, number]
}));

const AccessibleMap: React.FC<AccessibleMapProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSourceRef = useRef(new VectorSource());
  const userMarkerRef = useRef(new Feature());
  
  const [viewMode, setViewMode] = useState<'standard' | 'satellite'>('standard');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeMode, setRouteMode] = useState<'walking' | 'wheelchair'>('walking');
  const [userLocation, setUserLocation] = useState<number[] | null>(null);
  const [turnByTurnDirections, setTurnByTurnDirections] = useState<TurnByTurnDirection[]>([]);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);

  // Place accessibility markers on the map
  const placeMarkers = useCallback(() => {
    campusLocations.forEach((location) => {
      const coords = fromLonLat(location.coordinates);
      const marker = new Feature(new Point(coords));

      marker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn2.iconfinder.com/data/icons/wsd-map-markers-2/512/wsd_markers_97-512.png',
            scale: 0.04,
            anchor: [0.5, 1],
          }),
        })
      );

      vectorSourceRef.current.addFeature(marker);
    });
  }, []);

  // Start tracking user location
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const lonLat = [longitude, latitude];
        setUserLocation(lonLat as [number, number]);
        
        const coords = fromLonLat(lonLat);
  
        // Update marker position
        userMarkerRef.current.setGeometry(new Point(coords));
  
        // Ensure the marker is added only once
        if (!vectorSourceRef.current.hasFeature(userMarkerRef.current)) {
          userMarkerRef.current.setStyle(
            new Style({
              image: new Icon({
                src: 'https://cdn-icons-png.flaticon.com/128/884/884094.png',
                scale: 0.2,
              }),
            })
          );
          vectorSourceRef.current.addFeature(userMarkerRef.current);
        }
  
        // Follow user location
        if (mapInstance.current) {
          mapInstance.current.getView().setCenter(coords);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({ 
      source: vectorSourceRef.current 
    });

    const standardLayer = new TileLayer({ 
      source: new OSM(), 
      visible: true 
    });

    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        maxZoom: 19,
      }),
      visible: false,
    });

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [standardLayer, satelliteLayer, vectorLayer],
      view: new View({
        center: INITIAL_CENTER,
        zoom: 17,
        maxZoom: 19,
      }),
      controls: defaultControls(),
    });
    startTracking();
    placeMarkers();
    return () => {
      if (mapInstance.current) {
        mapInstance.current.setTarget(undefined);
        mapInstance.current = null;
      }
    };
  }, []);

  // Toggle between standard and satellite map views
  const toggleMapView = useCallback(() => {
    if (!mapInstance.current) return;

    const layers = mapInstance.current.getLayers().getArray();
    const standardLayer = layers[0];
    const satelliteLayer = layers[1];

    if (viewMode === 'standard') {
      standardLayer.setVisible(false);
      satelliteLayer.setVisible(true);
      setViewMode('satellite');
    } else {
      standardLayer.setVisible(true);
      satelliteLayer.setVisible(false);
      setViewMode('standard');
    }
  }, [viewMode]);

  // Toggle between walking and wheelchair route modes
  const toggleRouteMode = useCallback(() => {
    setRouteMode(routeMode === 'walking' ? 'wheelchair' : 'walking');
  }, [routeMode]);

  // Find location coordinates by name
  const findLocationByName = useCallback((query: string): number[] | null => {
    if (!query || query.toLowerCase() === 'my location') return null;
  
    const lowerQuery = query.toLowerCase();
  
    const exactMatch = campusLocations.find(loc => 
      loc.name.toLowerCase() === lowerQuery
    );
    if (exactMatch) return exactMatch.coordinates;
  
    const partialMatch = campusLocations.find(loc => 
      loc.name.toLowerCase().includes(lowerQuery)
    );
    return partialMatch ? partialMatch.coordinates : null;
  }, []);
  

  // Clear previous routes from the map
  const clearRoutes = useCallback(() => {
    const features = vectorSourceRef.current.getFeatures();
    features.forEach(feature => {
      // Remove only route lines and previous start/end markers
      if (feature.getGeometry() instanceof LineString || feature.get('type') === 'marker') {
        vectorSourceRef.current.removeFeature(feature);
      }
    });
    setTurnByTurnDirections([]);
  }, []);

  // Calculate route options when start and end locations are set
  useEffect(() => {
    if ((!startLocation && !userLocation) || !endLocation) {
      setIsFlyoutOpen(false);
      setRouteOptions([]);
      return;
    }
    

    const timer = setTimeout(() => {
      let startCoords;
      if (startLocation) {
        // If user entered a start location, use that
        startCoords = findLocationByName(startLocation);
      } else if (userLocation) {
        // If no start location entered, use current user location
        startCoords = userLocation;
      } else {
        return;
      }

      const endCoords = findLocationByName(endLocation);

      if ((!startLocation && !userLocation) || !endLocation) {
        setIsFlyoutOpen(false);
        setRouteOptions([]);
        return;
      }

      // Calculate routes
      orsDirections
        .calculate({
          coordinates: [startCoords, endCoords],
          profile: routeMode === 'wheelchair' ? 'wheelchair' : 'foot-walking',
          format: 'geojson',
          alternative_routes: { target_count: 3, share_factor: 0.6 },
          instructions: true
        })
        .then((response: any) => {
          const routes = response.features.map((feature: any, index: number) => ({
            id: index,
            summary: `Route ${index + 1}`,
            distance: feature.properties.summary.distance,
            duration: feature.properties.summary.duration,
            coordinates: feature.geometry.coordinates,
            steps: feature.properties.segments[0].steps
          }));
          setRouteOptions(routes);
          setIsFlyoutOpen(true);
          setSelectedRouteId(0); // Default to first route
        })
        .catch((err: Error) => {
          console.error('Route calculation error:', err);
          setIsFlyoutOpen(false);
          setRouteOptions([]);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [startLocation, endLocation, routeMode, findLocationByName, userLocation]);


  // Calculate and display the selected route
  const calculateRoute = useCallback(() => {
    if (selectedRouteId === null || !routeOptions.length) {
      alert('Please select a route to start.');
      return;
    }
  
    clearRoutes();
  
    let startCoords;
    if (startLocation && startLocation.toLowerCase() !== 'my location') {
      startCoords = findLocationByName(startLocation);
    } else if (userLocation) {
      startCoords = userLocation;
    }
  
    if (!startCoords) {
      alert('Unable to determine your current location. Please enter a start location.');
      return;
    }
  
    const endCoords = findLocationByName(endLocation);
  
    if (!endCoords) {
      alert('Please enter a valid end location');
      return;
    }
  
    // Convert coordinates to OpenLayers format
    const startPoint = fromLonLat(startCoords);
    const endPoint = fromLonLat(endCoords);
  
    // Create start marker (blue)
    const startMarker = new Feature(new Point(startPoint));
    startMarker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/128/7976/7976202.png',
          scale: 0.2,
          anchor: [0.5, 1],
        }),
      })
    );
    startMarker.set('type', 'marker');
  
    // Create end marker (red)
    const endMarker = new Feature(new Point(endPoint));
    endMarker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/128/9131/9131546.png',
          scale: 0.2,
          anchor: [0.5, 1],
        }),
      })
    );
    endMarker.set('type', 'marker');
  
    // Add markers to the vector source
    vectorSourceRef.current.addFeature(startMarker);
    vectorSourceRef.current.addFeature(endMarker);
  
    // Zoom to fit both markers
    if (mapInstance.current) {
      const extent = [
        Math.min(startPoint[0], endPoint[0]), // Min Longitude
        Math.min(startPoint[1], endPoint[1]), // Min Latitude
        Math.max(startPoint[0], endPoint[0]), // Max Longitude
        Math.max(startPoint[1], endPoint[1]), // Max Latitude
      ];
  
      mapInstance.current.getView().fit(extent, {
        padding: [50, 50, 50, 50], // Padding around the markers
        duration: 1000, // Zoom transition duration
        maxZoom: 18, // Maximum zoom level
      });
    }
  
    // Display the selected route
    const selectedRoute = routeOptions.find((route) => route.id === selectedRouteId);
    if (selectedRoute) {
      const routeFeature = new Feature({
        geometry: new LineString(
          selectedRoute.coordinates.map((coord: number[]) => fromLonLat(coord))
        ),
      });
  
      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: routeMode === 'wheelchair' ? '#4287f5' : '#2563eb',
            width: 4,
            lineDash: routeMode === 'wheelchair' ? [5, 5] : undefined,
          }),
        })
      );
  
      vectorSourceRef.current.addFeature(routeFeature);
  
      // Set turn-by-turn directions
      if (selectedRoute.steps) {
        const directions: TurnByTurnDirection[] = selectedRoute.steps.map((step: any) => ({
          type: step.type,
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        }));
        
        setTurnByTurnDirections(directions);
      }
    }
  
    // Close the flyout
    setIsFlyoutOpen(false);
  }, [startLocation, endLocation, selectedRouteId, routeOptions, clearRoutes, findLocationByName, userLocation, routeMode]);
  


  // Handle changing locations
  const handleStartLocationChange = useCallback((value: string) => {
    setStartLocation(value);
  }, []);

  const handleEndLocationChange = useCallback((value: string) => {
    setEndLocation(value);
  }, []);

  return (
    <div className="map-wrapper">
      <div className="map-page">
        <div className="top-bar">
          <div className="search-container">
            <MapSearch 
              onStartChange={handleStartLocationChange}
              onEndChange={handleEndLocationChange}
              onSubmit={calculateRoute}
              locations={campusLocations}
            />
            <div className="route-controls">
              <button 
                type="button" 
                onClick={calculateRoute}
                className="find-route-button"
                aria-label="Find route"
              >
                GO
              </button>
              <button
                type="button"
                onClick={toggleRouteMode}
                className={`route-mode-toggle ${routeMode === 'wheelchair' ? 'wheelchair-active' : ''}`}
                aria-label={`Switch to ${routeMode === 'wheelchair' ? 'standard walking' : 'wheelchair'} route`}
              >
                {routeMode === 'wheelchair' ? ' 🦽 Wheelchair' : ' 🚶 Walking'}
              </button>
            </div>
          </div>
        </div>

        <div className="map-content">
          {isFlyoutOpen && (
            <div className="route-flyout">
              <h2>Route Options</h2>
              {routeOptions.map((route) => (
                <div
                  key={route.id}
                  className={`route-option ${selectedRouteId === route.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <h3>{route.summary}</h3>
                  <p>Distance: {(route.distance / 1000).toFixed(2)} km</p>
                  <p>Duration: {Math.round(route.duration / 60)} minutes</p>
                </div>
              ))}
              <button 
                type="button" 
                onClick={calculateRoute}
                className="select-route-button"
                aria-label="Select this route"
              >
                Use Selected Route
              </button>
            </div>
          )}

          <div className={`map-root ${className || ''} ${isFlyoutOpen ? 'shifted' : ''}`}>
            <div 
              ref={mapRef} 
              className="map-container" 
              role="application"
              aria-label="Interactive map displaying user location and navigation"
            />
            <div className="map-controls">
              <button
                type="button"
                onClick={toggleMapView}
                className="map-toggle-button"
              >
                {viewMode === 'standard' ? 'Satellite View' : 'Standard View'}
              </button>
            </div>
          </div>
      </div>
        {turnByTurnDirections.length > 0 && (
          <div className="turn-by-turn-directions">
            <h3>Turn-by-Turn Directions</h3>
            <ul>
              {turnByTurnDirections.map((direction, index) => (
                <li key={index}>
                  {direction.instruction} 
                  <span className="direction-details">
                    (Distance: {(direction.distance / 0.621371).toFixed(1)} mi, 
                    Duration: {(direction.duration / 60).toFixed(1)} min)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibleMap;