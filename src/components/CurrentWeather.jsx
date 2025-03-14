import React from 'react';
import styled from '@emotion/styled';
import RadarMap from './RadarMap';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;
  width: 100%;
`;

const WeatherGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const WeatherInfo = styled.div`
  h2 {
    margin: 0 0 16px;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const LocationInfo = styled.div`
  margin-bottom: 16px;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Temperature = styled.div`
  font-size: 4rem;
  font-weight: 600;
  margin: 16px 0;
  
  span {
    font-size: 2rem;
    opacity: 0.7;
  }
`;

const WeatherDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const DetailItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 12px;
  
  h4 {
    margin: 0 0 8px;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
`;

const formatTemp = (temp) => {
  if (!temp) return 'N/A';
  const value = parseFloat(temp);
  return isNaN(value) ? 'N/A' : Math.round(value);
};

const CurrentWeather = ({ weatherData }) => {
  if (!weatherData?.current || !weatherData?.location) {
    return null;
  }
  
  const { current, location, coordinates } = weatherData;
  
  // Extract temperature from the NOAA API response
  const temperature = formatTemp(current.temperature?.value);
  const feelsLike = formatTemp(current.heatIndex?.value || current.windChill?.value || current.temperature?.value);
  
  // Get wind information
  const windSpeed = current.windSpeed?.value 
    ? `${Math.round(current.windSpeed.value)} ${current.windSpeed.unitCode === 'wmoUnit:km_h-1' ? 'km/h' : 'mph'}`
    : 'N/A';
  const windDirection = current.windDirection?.value || '';
  
  // Get humidity and visibility
  const humidity = current.relativeHumidity?.value 
    ? Math.round(current.relativeHumidity.value) 
    : 'N/A';
  const visibility = current.visibility?.value
    ? `${Math.round(current.visibility.value)} ${current.visibility.unitCode === 'wmoUnit:km' ? 'km' : 'mi'}`
    : 'N/A';

  return (
    <Container>
      <WeatherCard>
        <WeatherGrid>
          <WeatherInfo>
            <h2>Current Conditions</h2>
            <LocationInfo>
              {location.city}, {location.state}
            </LocationInfo>
            <Temperature>
              {temperature}°<span>F</span>
            </Temperature>
            <p>{current.textDescription || 'No description available'}</p>
            
            <WeatherDetails>
              <DetailItem>
                <h4>Feels Like</h4>
                <p>{feelsLike}°F</p>
              </DetailItem>
              <DetailItem>
                <h4>Wind</h4>
                <p>{windSpeed} {windDirection}</p>
              </DetailItem>
              <DetailItem>
                <h4>Humidity</h4>
                <p>{humidity}%</p>
              </DetailItem>
              <DetailItem>
                <h4>Visibility</h4>
                <p>{visibility}</p>
              </DetailItem>
            </WeatherDetails>
          </WeatherInfo>
          
          <MapContainer>
            {coordinates && (
              <RadarMap coordinates={coordinates} />
            )}
          </MapContainer>
        </WeatherGrid>
      </WeatherCard>
    </Container>
  );
};

export default CurrentWeather;
