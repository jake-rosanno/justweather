import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, LayerGroup, LayersControl } from 'react-leaflet';
import styled from '@emotion/styled';
import 'leaflet/dist/leaflet.css';
import { getRadarUrl, getRadarTimestamps, getRadarProducts } from '../services/weatherService';

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.1);
  position: relative;
  
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

  .leaflet-control-layers {
    background: rgba(0, 0, 0, 0.7) !important;
    backdrop-filter: blur(10px);
    border: none;
    border-radius: 8px;
    color: white;
    
    &-toggle {
      background-color: rgba(0, 0, 0, 0.7);
      border: none;
    }
    
    &-expanded {
      padding: 12px;
      min-width: 200px;
    }
  }
`;

const TimeControls = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;

  @media (max-width: 768px) {
    bottom: 10px;
    padding: 6px 12px;
    gap: 8px;
  }
`;

const TimeSlider = styled.input`
  width: 200px;
  margin: 0;
  
  @media (max-width: 768px) {
    width: 150px;
  }
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const RadarMap = ({ coordinates }) => {
  const [error, setError] = useState(false);
  const [timestamps, setTimestamps] = useState([]);
  const [currentTimestamp, setCurrentTimestamp] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('standard');
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef(null);
  const products = getRadarProducts();
  
  useEffect(() => {
    try {
      const times = getRadarTimestamps();
      setTimestamps(times);
      setCurrentTimestamp(times[times.length - 1]);
      setError(false);
    } catch (err) {
      console.error('Error setting up radar:', err);
      setError(true);
    }
  }, []);

  const handleProductChange = (event) => {
    setSelectedProduct(event.target.value);
  };

  const handleTimeChange = (event) => {
    setCurrentTimestamp(timestamps[event.target.value]);
  };

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      let frame = 0;
      animationRef.current = setInterval(() => {
        frame = (frame + 1) % timestamps.length;
        setCurrentTimestamp(timestamps[frame]);
      }, 500);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [isPlaying, timestamps]);

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
        
        <LayersControl position="topright">
          {products.map(product => (
            <LayersControl.Overlay 
              key={product.id} 
              name={product.name} 
              checked={product.id === selectedProduct}
            >
              <LayerGroup>
                <TileLayer
                  url={getRadarUrl(currentTimestamp, product.id)}
                  opacity={0.7}
                  attribution='&copy; <a href="https://www.weather.gov">NOAA</a>'
                />
              </LayerGroup>
            </LayersControl.Overlay>
          ))}
        </LayersControl>
      </MapContainer>

      {/* Time controls */}
      <TimeControls>
        <PlayButton onClick={togglePlay}>
          {isPlaying ? (
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M8 5v14l11-7z"/>
            </svg>
          )}
        </PlayButton>
        <TimeSlider
          type="range"
          min="0"
          max={timestamps.length - 1}
          value={timestamps.indexOf(currentTimestamp)}
          onChange={handleTimeChange}
        />
      </TimeControls>
    </MapWrapper>
  );
};

export default RadarMap;
