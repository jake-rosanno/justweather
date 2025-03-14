import React from 'react';
import styled from '@emotion/styled';

const WeatherContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const WeatherCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  color: white;
`;

const Temperature = styled.h1`
  font-size: 3.5rem;
  margin: 0;
  font-weight: 600;
`;

const Description = styled.p`
  font-size: 1.2rem;
  margin: 8px 0;
  opacity: 0.9;
`;

const LocationName = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 16px 0;
  opacity: 0.9;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const DetailItem = styled.div`
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  
  h4 {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  p {
    margin: 0;
    font-size: 1.1rem;
  }
`;

const HourlyContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 12px;
  padding: 8px 4px;
  margin: 0 -20px;
  padding: 0 20px 16px;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

const HourlyItem = styled.div`
  flex: 0 0 auto;
  width: 80px;
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
  }
`;

const formatHour = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
};

const WeatherDisplay = ({ weatherData }) => {
  if (!weatherData) {
    return <WeatherContainer>Loading weather data...</WeatherContainer>;
  }

  const { forecast, hourly, location } = weatherData;
  const currentPeriod = forecast.periods[0];
  const hourlyPeriods = hourly.periods.slice(0, 24); // Next 24 hours

  return (
    <WeatherContainer>
      <WeatherCard>
        <LocationName>{location.city}, {location.state}</LocationName>
        <Temperature>{currentPeriod.temperature}°{currentPeriod.temperatureUnit}</Temperature>
        <Description>{currentPeriod.shortForecast}</Description>
        
        <DetailGrid>
          <DetailItem>
            <h4>Wind</h4>
            <p>{currentPeriod.windSpeed} {currentPeriod.windDirection}</p>
          </DetailItem>
          <DetailItem>
            <h4>Humidity</h4>
            <p>{currentPeriod.relativeHumidity?.value || 'N/A'}%</p>
          </DetailItem>
          <DetailItem>
            <h4>Feels Like</h4>
            <p>{currentPeriod.temperature}°{currentPeriod.temperatureUnit}</p>
          </DetailItem>
        </DetailGrid>
      </WeatherCard>

      <WeatherCard>
        <h3>Hourly Forecast</h3>
        <HourlyContainer>
          {hourlyPeriods.map((period) => (
            <HourlyItem key={period.number}>
              <h4>{formatHour(period.startTime)}</h4>
              <p>{period.temperature}°</p>
              <img 
                src={period.icon} 
                alt={period.shortForecast}
                style={{ width: '32px', height: '32px', margin: '4px 0' }}
              />
            </HourlyItem>
          ))}
        </HourlyContainer>
      </WeatherCard>
      
      <WeatherCard>
        <h3>Extended Forecast</h3>
        <DetailGrid>
          {forecast.periods.slice(1, 5).map((period) => (
            <DetailItem key={period.number}>
              <h4>{period.name}</h4>
              <p>{period.temperature}°{period.temperatureUnit}</p>
              <Description style={{ fontSize: '0.9rem' }}>{period.shortForecast}</Description>
            </DetailItem>
          ))}
        </DetailGrid>
      </WeatherCard>
    </WeatherContainer>
  );
};

export default WeatherDisplay;
