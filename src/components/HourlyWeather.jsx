import React from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  width: 70%;
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    width: 85%;
  }
  
  @media (max-width: 768px) {
    width: 95%;
  }
`;

const HourlyCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 16px;

  h3 {
    margin: 0 0 24px;
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const HourlyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HourCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s ease;
  display: grid;
  grid-template-columns: 120px 48px 100px minmax(200px, 1fr) auto;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 90px 48px 80px minmax(150px, 1fr) auto;
    gap: 16px;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 70px 40px 60px 1fr;
    gap: 12px;
  }
  
  &:hover {
    transform: translateX(4px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Time = styled.div`
  font-size: 1rem;
  font-weight: 500;
`;

const WeatherIcon = styled.img`
  width: 48px;
  height: 48px;
  filter: brightness(1.2);
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
  }
`;

const Temperature = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Condition = styled.div`
  font-size: 1rem;
  line-height: 1.3;
`;

const Details = styled.div`
  display: flex;
  gap: 24px;
  font-size: 0.9rem;
  opacity: 0.9;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  span:first-of-type {
    opacity: 0.7;
  }
`;

const formatHour = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // If it's today, just show the time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // If it's tomorrow, show "Tomorrow" + time
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    })}`;
  }
  
  // Otherwise show day + time
  return date.toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    hour12: true
  });
};

const formatTemp = (temp) => {
  if (!temp) return 'N/A';
  return Math.round(temp);
};

const formatWind = (speed, direction) => {
  if (!speed || !direction) return 'N/A';
  return `${speed} ${direction}`;
};

const HourlyWeather = ({ weatherData }) => {
  if (!weatherData?.hourly?.periods) return null;

  const hourlyPeriods = weatherData.hourly.periods.slice(0, 24);

  return (
    <Container>
      <HourlyCard>
        <h3>Next 24 Hours</h3>
        <HourlyList>
          {hourlyPeriods.map((period) => (
            <HourCard key={period.number}>
              <Time>{formatHour(period.startTime)}</Time>
              <WeatherIcon 
                src={period.icon} 
                alt={period.shortForecast}
              />
              <Temperature>
                {formatTemp(period.temperature)}°
              </Temperature>
              <Condition>
                {period.shortForecast}
              </Condition>
              <Details>
                <DetailItem>
                  <span>Wind</span>
                  <span>{formatWind(period.windSpeed, period.windDirection)}</span>
                </DetailItem>
                <DetailItem>
                  <span>Humidity</span>
                  <span>{period.relativeHumidity?.value || 'N/A'}%</span>
                </DetailItem>
              </Details>
            </HourCard>
          ))}
        </HourlyList>
      </HourlyCard>
    </Container>
  );
};

export default HourlyWeather;
