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

const ForecastCard = styled.div`
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

const DayList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DayCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s ease;
  display: grid;
  grid-template-columns: 140px 100px minmax(180px, 1fr) minmax(180px, 1fr);
  align-items: center;
  gap: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 120px 90px 1fr 1fr;
    gap: 16px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 100px 80px 1fr;
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 90px 70px 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  &:hover {
    transform: translateX(4px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Date = styled.div`
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TemperatureRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  white-space: nowrap;
  
  .high {
    font-weight: 600;
  }
  
  .low {
    opacity: 0.7;
  }
  
  .separator {
    opacity: 0.3;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    gap: 6px;
  }
`;

const Period = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0; // Enable text truncation
  
  @media (max-width: 768px) {
    &:last-child {
      display: none;
    }
  }
`;

const WeatherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0; // Enable text truncation
  flex: 1;
  
  img {
    width: 36px;
    height: 36px;
    filter: brightness(1.2);
    flex-shrink: 0;
  }
  
  p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  @media (max-width: 480px) {
    img {
      width: 32px;
      height: 32px;
    }
    
    p {
      font-size: 0.85rem;
      -webkit-line-clamp: 1;
    }
  }
`;

const Details = styled.div`
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  opacity: 0.9;
  margin-left: auto;
  flex-shrink: 0;
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  
  span:first-of-type {
    opacity: 0.7;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 32px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
`;

const formatDay = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }
    
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

const formatTemp = (temp) => {
  if (!temp || isNaN(parseFloat(temp))) return 'N/A';
  return Math.round(parseFloat(temp));
};

const TenDayForecast = ({ weatherData }) => {
  // Validate weather data structure
  if (!weatherData?.forecast?.periods || !Array.isArray(weatherData.forecast.periods)) {
    return (
      <Container>
        <ForecastCard>
          <h3>10-Day Forecast</h3>
          <ErrorMessage>
            Forecast data is currently unavailable
          </ErrorMessage>
        </ForecastCard>
      </Container>
    );
  }

  // Group periods into days (each day has day and night)
  const days = [];
  try {
    for (let i = 0; i < weatherData.forecast.periods.length; i += 2) {
      const dayPeriod = weatherData.forecast.periods[i];
      const nightPeriod = weatherData.forecast.periods[i + 1];
      
      // Validate both periods exist and have required properties
      if (dayPeriod?.startTime && 
          dayPeriod?.temperature !== undefined && 
          nightPeriod?.temperature !== undefined) {
        days.push({
          date: dayPeriod.startTime,
          day: {
            ...dayPeriod,
            shortForecast: dayPeriod.shortForecast || 'No forecast available',
            windSpeed: dayPeriod.windSpeed || 'N/A',
            windDirection: dayPeriod.windDirection || '',
            icon: dayPeriod.icon || '',
            probabilityOfPrecipitation: {
              value: dayPeriod.probabilityOfPrecipitation?.value ?? 0
            }
          },
          night: {
            ...nightPeriod,
            shortForecast: nightPeriod.shortForecast || 'No forecast available',
            windSpeed: nightPeriod.windSpeed || 'N/A',
            windDirection: nightPeriod.windDirection || '',
            icon: nightPeriod.icon || '',
            probabilityOfPrecipitation: {
              value: nightPeriod.probabilityOfPrecipitation?.value ?? 0
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error processing forecast data:', error);
    return (
      <Container>
        <ForecastCard>
          <h3>10-Day Forecast</h3>
          <ErrorMessage>
            Error processing forecast data. Please try again later.
          </ErrorMessage>
        </ForecastCard>
      </Container>
    );
  }

  // If no valid days were processed
  if (days.length === 0) {
    return (
      <Container>
        <ForecastCard>
          <h3>10-Day Forecast</h3>
          <ErrorMessage>
            No forecast data available for this location
          </ErrorMessage>
        </ForecastCard>
      </Container>
    );
  }

  return (
    <Container>
      <ForecastCard>
        <h3>10-Day Forecast</h3>
        <DayList>
          {days.slice(0, 10).map((day, index) => (
            <DayCard key={index}>
              <Date>{formatDay(day.date)}</Date>
              <TemperatureRange>
                <span className="high">{formatTemp(day.day.temperature)}°</span>
                <span className="separator">/</span>
                <span className="low">{formatTemp(day.night.temperature)}°</span>
              </TemperatureRange>
              
              <Period>
                <WeatherInfo>
                  {day.day.icon && (
                    <img src={day.day.icon} alt={day.day.shortForecast} />
                  )}
                  <p>{day.day.shortForecast}</p>
                </WeatherInfo>
                <Details>
                  <DetailItem>
                    <span>Wind</span>
                    <span>{day.day.windSpeed} {day.day.windDirection}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>Rain</span>
                    <span>{day.day.probabilityOfPrecipitation?.value || 0}%</span>
                  </DetailItem>
                </Details>
              </Period>
              
              <Period>
                <WeatherInfo>
                  {day.night.icon && (
                    <img src={day.night.icon} alt={day.night.shortForecast} />
                  )}
                  <p>{day.night.shortForecast}</p>
                </WeatherInfo>
                <Details>
                  <DetailItem>
                    <span>Wind</span>
                    <span>{day.night.windSpeed} {day.night.windDirection}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>Rain</span>
                    <span>{day.night.probabilityOfPrecipitation?.value || 0}%</span>
                  </DetailItem>
                </Details>
              </Period>
            </DayCard>
          ))}
        </DayList>
      </ForecastCard>
    </Container>
  );
};

export default TenDayForecast;
