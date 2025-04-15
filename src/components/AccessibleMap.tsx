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
import { Coordinate } from 'ol/coordinate';
import wheelchairIcon from "./../assets/wheelchair-icon.png";
import volumeIcon from "./../assets/volume-icon.png";
import contrastIcon from "./../assets/high-contrast-icon.png";
import bookmarkIcon from "./../assets/bookmark-icon.png";

// OpenRouteService API
const orsDirections = new Openrouteservice.Directions({
  api_key: '5b3ce3597851110001cf6248a1d686e75cef4e86a9782464ccdb71cf',
});

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
  startLocation?: string; // Added for bookmarking
  endLocation?: string;   // Added for bookmarking
  routeMode?: 'wheelchair' | 'walking'; // Added for bookmarking
}

const INITIAL_CENTER = fromLonLat([-84.5831, 34.0390]);

// Load campus locations from JSON file
const campusLocations: Location[] = locationsData.locations.map(loc => ({
  name: loc.name,
  coordinates: loc.coordinates as unknown as [number, number]
}));

const AccessibleMap: React.FC<AccessibleMapProps> = ({ className }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSourceRef = useRef(new VectorSource());
  const userMarkerRef = useRef(new Feature());
  const [viewMode, setViewMode] = useState<'standard' | 'satellite'>('standard');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [routeMode, setRouteMode] = useState<'wheelchair' | 'walking'>('wheelchair');
  const [userLocation, setUserLocation] = useState<number[] | null>(null);
  const [turnByTurnDirections, setTurnByTurnDirections] = useState<TurnByTurnDirection[]>([]);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [showWheelchairIcons, setShowWheelchairIcons] = useState(true);
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [isRouteActive, setIsRouteActive] = useState(false);

  // New states for bookmark functionality
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState<RouteOption[]>([]);
  const [isBookmarkFlyoutOpen, setIsBookmarkFlyoutOpen] = useState(false);

  // Place accessibility markers on the map
  const placeMarkers = useCallback((showIcons: boolean) => {
    const features = vectorSourceRef.current.getFeatures();
    features.forEach(feature => {
      if (feature.get('type') === 'accessibility-marker') {
        vectorSourceRef.current.removeFeature(feature);
      }
    });
    
    if (!showIcons) {
      setShowWheelchairIcons(false);
      return;
    }
    
    campusLocations.forEach((location) => {
      const coords = fromLonLat(location.coordinates);
      const marker = new Feature(new Point(coords));

      marker.set('type', 'accessibility-marker');

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
    setShowWheelchairIcons(true);
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
  
        userMarkerRef.current.setGeometry(new Point(coords));

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
  userMarkerRef.current.set('type', 'user-location');

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
    placeMarkers(showWheelchairIcons);
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
      if (feature.getGeometry() instanceof LineString || feature.get('type') === 'marker') {
        vectorSourceRef.current.removeFeature(feature);
      }
    });
    setTurnByTurnDirections([]);
    setCurrentDirectionIndex(0);
    setStepByStepMode(false);
    setIsRouteActive(false);
    setStartLocation('');
    setEndLocation('');
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
        startCoords = findLocationByName(startLocation);
      } else if (userLocation) {
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
            steps: feature.properties.segments[0].steps,
            startLocation: startLocation || 'My Location',
            endLocation: endLocation,
            routeMode: routeMode
          }));
          setRouteOptions(routes);
          setIsFlyoutOpen(true);
          setSelectedRouteId(0);
        })
        .catch((err: Error) => {
          console.error('Route calculation error:', err);
          setIsFlyoutOpen(false);
          setRouteOptions([]);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [startLocation, endLocation, routeMode, findLocationByName, userLocation]);

  // Toggle bookmark flyout
  const toggleBookmarkFlyout = () => {
    setIsBookmarkFlyoutOpen(!isBookmarkFlyoutOpen);
  };

  // Handle bookmark click for a route
  const handleBookmarkClick = (route: RouteOption) => {
    const isBookmarked = bookmarkedRoutes.some(r => r.id === route.id);
    if (isBookmarked) {
      setBookmarkedRoutes(bookmarkedRoutes.filter(r => r.id !== route.id));
    } else {
      setBookmarkedRoutes([...bookmarkedRoutes, route]);
    }
  };

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
  
    const startPoint = fromLonLat(startCoords);
    const endPoint = fromLonLat(endCoords);
  
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
  
    vectorSourceRef.current.addFeature(startMarker);
    vectorSourceRef.current.addFeature(endMarker);
  
    if (mapInstance.current) {
      const extent = [
        Math.min(startPoint[0], endPoint[0]), 
        Math.min(startPoint[1], endPoint[1]), 
        Math.max(startPoint[0], endPoint[0]), 
        Math.max(startPoint[1], endPoint[1]), 
      ];
  
      mapInstance.current.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
        maxZoom: 18,
      });
    }
  
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
  
      if (selectedRoute.steps) {
        const directions: TurnByTurnDirection[] = selectedRoute.steps.map((step: any) => ({
          type: step.type,
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration
        }));
        
        setTurnByTurnDirections(directions);
        setCurrentDirectionIndex(0);
      }
    }
    
    setIsRouteActive(true);
    setIsFlyoutOpen(false);
  }, [startLocation, endLocation, selectedRouteId, routeOptions, clearRoutes, findLocationByName, userLocation, routeMode]);

  const handleArrived = useCallback(() => {
    alert('You have arrived at your destination.');
    clearRoutes();
  }, [clearRoutes]);

  const handleStartLocationChange = useCallback((value: string) => {
    setStartLocation(value);
  }, []);

  const handleEndLocationChange = useCallback((value: string) => {
    setEndLocation(value);
  }, []);

  const nextDirection = useCallback(() => {
    if (currentDirectionIndex < turnByTurnDirections.length - 1) {
      setCurrentDirectionIndex(currentDirectionIndex + 1);
    }
  }, [currentDirectionIndex, turnByTurnDirections.length]);

  const prevDirection = useCallback(() => {
    if (currentDirectionIndex > 0) {
      setCurrentDirectionIndex(currentDirectionIndex - 1);
    }
  }, [currentDirectionIndex]);

  const toggleDirectionMode = useCallback(() => {
    setStepByStepMode(!stepByStepMode);
  }, [stepByStepMode]);

  const previewRoute = useCallback((route: { coordinates: Coordinate[]; }) => {
    clearPreviewRoute();

    const routeFeature = new Feature({
      geometry: new LineString(
        route.coordinates.map((coord: Coordinate) => fromLonLat(coord))
      ),
    });

    routeFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: 'rgba(37, 99, 235, 0.5)',
          width: 4,
        }),
      })
    );
    routeFeature.set('type', 'preview');
    
    vectorSourceRef.current.addFeature(routeFeature);
  }, []);

  const clearPreviewRoute = useCallback(() => {
    const features = vectorSourceRef.current.getFeatures();
    features.forEach(feature => {
      if (feature.get('type') === 'preview') {
        vectorSourceRef.current.removeFeature(feature);
      }
    });
  }, []);

  return (
    <div className="map-wrapper">
      <div className="map-page">
      <h1 className="title">Kennesaw State University - Accessible Map</h1>
        <div className="top-bar">
          <div className="search-container">
            <MapSearch 
              onStartChange={handleStartLocationChange}
              onEndChange={handleEndLocationChange}
              onSubmit={calculateRoute}
              locations={campusLocations}
            />
          </div>
        </div>

        <div className="map-content">
          {isFlyoutOpen && (
            <div className="route-flyout">
              <h2>Route Options</h2>
              {routeOptions.map((route) => {
                const isBookmarked = bookmarkedRoutes.some(r => r.id === route.id);
                return (
                  <div
                    key={route.id}
                    className={`route-option ${selectedRouteId === route.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRouteId(route.id)}
                    onMouseEnter={() => previewRoute(route)}
                    onMouseLeave={() => clearPreviewRoute()}
                  >
                    <div className="route-header">
                      <h3>
                        <span className="walking-icon">🚶</span>
                        {startLocation || 'My Location'} to {endLocation}
                      </h3>
                      <button
                        className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent route selection when clicking bookmark
                          handleBookmarkClick(route);
                        }}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        <img
                          src={bookmarkIcon}
                          alt="Bookmark"
                          className="bookmark-icon"
                        />
                      </button>
                    </div>
                    <p>Distance: {(route.distance / 1000).toFixed(2)} km</p>
                    <p>Duration: {Math.round(route.duration / 60)} minutes</p>
                  </div>
                );
              })}
            </div>
          )}

          {isBookmarkFlyoutOpen && (
            <div className="bookmark-flyout">
              <h2>Saved Routes</h2>
              {bookmarkedRoutes.length === 0 ? (
                <p>No bookmarked routes yet.</p>
              ) : (
                bookmarkedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="bookmark-option"
                    onClick={() => {
                      setStartLocation(route.startLocation || '');
                      setEndLocation(route.endLocation || '');
                      setRouteMode(route.routeMode || 'wheelchair');
                      setIsBookmarkFlyoutOpen(false);
                    }}
                  >
                    <h3>
                      <span className="walking-icon">🚶</span>
                      {route.startLocation} to {route.endLocation}
                    </h3>
                    <p>Distance: {(route.distance / 1000).toFixed(2)} km</p>
                    <p>Duration: {Math.round(route.duration / 60)} minutes</p>
                    <p>Mode: {route.routeMode}</p>
                  </div>
                ))
              )}
            </div>
          )}

          <div className={`map-root ${className || ''} ${isFlyoutOpen ? 'shifted' : ''} ${isBookmarkFlyoutOpen ? 'bookmark-shifted' : ''}`}>
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
          <div className="icon-bar">
            <a href="#" className="icon-container" 
              onClick={() =>{ 
                placeMarkers(!showWheelchairIcons);
                toggleRouteMode();} }
              aria-label="Toggle accessible routing">
              <img className='icon' src={wheelchairIcon} alt="Accessible entrances"/>
            </a>
            <a href="#" className="icon-container" aria-label="Enable audio directions">
              <img className='icon' src={volumeIcon} alt="Audio directions"/>
            </a>
            <a href="#" className="icon-container" aria-label="Toggle high contrast mode">
              <img className='icon' src={contrastIcon} alt="High-contrast mode"/>
            </a>
            <a href="#" className="icon-container" 
              onClick={toggleBookmarkFlyout}
              aria-label="Toggle bookmarked routes">
              <img className='icon' src={bookmarkIcon} alt="Bookmarks"/>
            </a>
          </div>
        </div>

        {turnByTurnDirections.length > 0 && (
          <div className="turn-by-turn-directions">
            <div className="directions-header">
              <h3>Directions</h3>
              <div className="directions-controls">
                {isRouteActive && (
                <button
                  type="button"
                  onClick={handleArrived}
                  className="arrived-button"
                  aria-label="Indicate that you have reached your destination"
                >
                  I've Arrived
                </button>
              )}
                <button 
                  className="cancel-route-button"
                  onClick={clearRoutes}
                  aria-label="Cancel navigation and clear the route"
                >
                  Cancel Route
                </button>

                <button 
                  className="toggle-view-button"
                  onClick={toggleDirectionMode}
                >
                  {stepByStepMode ? 'Show All' : 'Step by Step'}
                </button>
              </div>
            </div>

            {stepByStepMode ? (
              <div className="step-by-step-view">
                <div className="current-step">
                  <p>{turnByTurnDirections[currentDirectionIndex].instruction}</p>
                  <p className="direction-details">
                    Distance: {(turnByTurnDirections[currentDirectionIndex].distance / 1609.34).toFixed(2)} mi,
                    Time: {(turnByTurnDirections[currentDirectionIndex].duration / 60).toFixed(1)} min
                  </p>
                </div>
                <div className="step-controls">
                  <button
                    onClick={prevDirection}
                    disabled={currentDirectionIndex === 0}
                    className="step-button"
                  >
                    ← Previous
                  </button>
                  <span className="step-counter">
                    {currentDirectionIndex + 1} of {turnByTurnDirections.length}
                  </span>
                  <button
                    onClick={nextDirection}
                    disabled={currentDirectionIndex === turnByTurnDirections.length - 1}
                    className="step-button"
                  >
                    Next →
                  </button>
                </div>
              </div>
            ) : (
              <ul className="directions-list">
                {turnByTurnDirections.map((direction, index) => (
                  <li key={index} className={index === currentDirectionIndex ? 'current-direction' : ''}>
                    <span className="direction-number">{index + 1}.</span>
                    {direction.instruction}
                    <span className="direction-details">
                      (Distance: {(direction.distance / 1609.34).toFixed(2)} mi,
                      Duration: {(direction.duration / 60).toFixed(1)} min)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className='footer'>
          <div className='footer-section'>
            <p className="section-heading">Contact Info</p>
            <div className='section-info'>
              <div className='two-col'>
                <div>
                  <p><strong>Kennesaw Campus</strong><br />1000 Chastain Road<br />Kennesaw, GA 30144</p>
                  <p><strong>Marietta Campus</strong><br />1100 South Marietta Pkwy<br />Marietta, GA 30060</p>
                </div>
                <div>
                  <p><strong>Phone</strong><br />470-KSU-INFO<br />(470-578-4636)</p>
                </div>
              </div>
            </div>
          </div>
          <div className='footer-section'>
            <p className="section-heading">Accessibility Resources</p>
            <div className='section-info'>
              <div className='two-col'>
                <div>
                  <p><strong><a href="https://www.kennesaw.edu/student-affairs/dean-of-students/student-disability-services/index.php">Student Disability Services</a></strong></p>
                  <p>
                    <strong>Kennesaw Campus</strong>
                    <br />
                    <strong>Location: Kennesaw Hall, Suite 1205</strong>
                    <br /><br />
                    <strong>Mailing Address:</strong> <br />
                    585 Cobb Ave NW
                    MD 0128
                    Kennesaw, GA 30144
                    <br /> <br />
                    <strong>Phone:</strong> (470) 578-2666 <br />
                    <strong>Fax:</strong> (470) 578-9111 <br />
                    <strong>Email:</strong> sds@kennesaw.edu <br /> <br />
                    <strong>Office Hours:</strong> <br /> Monday - Friday, 8:00am - 5:00pm <br />
                  </p>
                </div>
                <div>
                  <p><strong><a href="https://maps.kennesaw.edu/">Campus Maps</a></strong></p>
                  <p>
                    <strong>Marietta Campus</strong>
                    <br />
                    <strong>Location: Joe Mack Wilson Student Center, Suite 160</strong>
                    <br /><br />
                    <strong>Mailing Address:</strong> <br />
                    860 Rossbacher Way
                    MD 9008
                    Marietta, GA 30060
                    <br /> <br />
                    <strong>Phone:</strong> (470) 578-7361 <br />
                    <strong>Fax:</strong> (470) 578-9111 <br />
                    <strong>Email:</strong> sds@kennesaw.edu <br /> <br />
                    <strong>Office Hours:</strong> <br /> Monday - Friday, 8:00am - 5:00pm <br />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibleMap;
