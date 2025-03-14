import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, LayerGroup } from 'react-leaflet';
import styled from '@emotion/styled';
import 'leaflet/dist/leaflet.css';
import { getRadarUrl } from '../services/weatherService';

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  
  .leaflet-container {
    height: 100%;
    width: 100%;
    background: transparent;
  }

  .leaflet-control-attribution {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(10px);
    color: rgba(255, 255, 255, 0.7);
    
    a {
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const RadarMap = ({ coordinates }) => {
  const [error, setError] = useState(false);
  const [radarUrl, setRadarUrl] = useState('');
  
  useEffect(() => {
    try {
      // Get the radar URL with current timestamp
      const url = getRadarUrl();
      setRadarUrl(url);
      setError(false);
    } catch (err) {
      console.error('Error setting up radar:', err);
      setError(true);
    }
  }, []);

  if (!coordinates?.latitude || !coordinates?.longitude || error) {
    return (
      <MapWrapper>
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          padding: '20px',
          textAlign: 'center'
        }}>
          {error ? 'Unable to load radar data' : 'Loading radar...'}
        </div>
      </MapWrapper>
    );
  }

  const center = [
    parseFloat(coordinates.latitude),
    parseFloat(coordinates.longitude)
  ];

  return (
    <MapWrapper>
      <MapContainer 
        center={center} 
        zoom={7} 
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={true}
      >
        {/* Dark base map layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />
        
        {/* Radar overlay */}
        {radarUrl && (
          <LayerGroup>
            <TileLayer
              url={radarUrl}
              opacity={0.7}
              attribution='&copy; <a href="https://www.weather.gov">NOAA</a>'
            />
          </LayerGroup>
        )}
      </MapContainer>
    </MapWrapper>
  );
};

export default RadarMap;
