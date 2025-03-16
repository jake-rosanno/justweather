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
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 16px;

  h3 {
    margin: 0 0 24px;
    font-size: 1.5rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 20px;
  }
`;

const DayList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const DayCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: 100px 120px minmax(300px, 3fr) minmax(100px, 1fr);
  align-items: center;
  gap: 16px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 90px 110px minmax(200px, 2fr) minmax(90px, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 16px;
  }
`;

const Date = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
  text-transform: capitalize;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 8px;
  }
`;

const TemperatureRange = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  white-space: nowrap;
  letter-spacing: -0.5px;
  
  .high {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }
  
  .low {
    opacity: 0.6;
  }
  
  .separator {
    opacity: 0.3;
    margin: 0 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    gap: 6px;
  }
`;

const WeatherPeriod = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  .period-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.5;
    margin-bottom: -2px;
  }
  
  .weather-row {
    display: flex;
    align-items: center;
    gap: 12px;
    
    img {
      width: 28px;
      height: 28px;
      filter: brightness(1.2) contrast(1.1);
    }
    
    p {
      margin: 0;
      font-size: 0.95rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: rgba(255, 255, 255, 0.85);
      letter-spacing: -0.2px;
    }
  }
  
  @media (max-width: 768px) {
    &.night {
      display: none;
    }
    
    .weather-row {
      img {
        width: 24px;
        height: 24px;
      }
      p {
        font-size: 0.9rem;
      }
    }
  }
`;

const WeatherPeriodsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  width: 100%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.9rem;
  opacity: 0.85;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  
  span:first-of-type {
    opacity: 0.7;
    font-size: 1.1rem;
  }
  
  span:last-of-type {
    letter-spacing: -0.3px;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 32px;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
`;

const formatTemp = (temp) => {
  if (!temp || isNaN(parseFloat(temp))) return 'N/A';
  return Math.round(parseFloat(temp));
};

const TenDayForecast = ({ weatherData }) => {
  try {
    // Basic validation of forecast data
    if (!weatherData?.forecast?.periods?.length) {
      console.log('Missing forecast data:', weatherData);
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

    // Get all day periods (NOAA API alternates between day and night)
    const allPeriods = weatherData.forecast.periods;
    console.log('All periods:', allPeriods);

    // Find day periods and their corresponding night periods
    const days = [];
    for (let i = 0; i < allPeriods.length && days.length < 10; i++) {
      const period = allPeriods[i];
      
      if (period.isDaytime) {
        const nightPeriod = allPeriods[i + 1];
        days.push({
          name: period.name.split(' ')[0],
          day: {
            temperature: period.temperature,
            shortForecast: period.shortForecast,
            icon: period.icon,
            windSpeed: period.windSpeed,
            probabilityOfPrecipitation: period.probabilityOfPrecipitation || { value: 0 }
          },
          night: nightPeriod ? {
            temperature: nightPeriod.temperature,
            shortForecast: nightPeriod.shortForecast,
            icon: nightPeriod.icon,
            windSpeed: nightPeriod.windSpeed,
            probabilityOfPrecipitation: nightPeriod.probabilityOfPrecipitation || { value: 0 }
          } : {
            temperature: period.temperature,
            shortForecast: period.shortForecast,
            icon: period.icon,
            windSpeed: period.windSpeed,
            probabilityOfPrecipitation: period.probabilityOfPrecipitation || { value: 0 }
          }
        });
      }
    }

    if (days.length === 0) {
      console.log('No days processed from periods');
      return (
        <Container>
          <ForecastCard>
            <h3>10-Day Forecast</h3>
            <ErrorMessage>
              No forecast data available
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
            {days.map((day, index) => (
              <DayCard key={index}>
                <Date>{day.name}</Date>
                
                <TemperatureRange>
                  <span className="high">{formatTemp(day.day.temperature)}°</span>
                  <span className="separator">/</span>
                  <span className="low">{formatTemp(day.night.temperature)}°</span>
                </TemperatureRange>
                
                <WeatherPeriodsContainer>
                  <WeatherPeriod className="day">
                    <span className="period-label">Day</span>
                    <div className="weather-row">
                      {day.day.icon && (
                        <img src={day.day.icon} alt={day.day.shortForecast} />
                      )}
                      <p>{day.day.shortForecast}</p>
                    </div>
                  </WeatherPeriod>
                  
                  <WeatherPeriod className="night">
                    <span className="period-label">Night</span>
                    <div className="weather-row">
                      {day.night.icon && (
                        <img src={day.night.icon} alt={day.night.shortForecast} />
                      )}
                      <p>{day.night.shortForecast}</p>
                    </div>
                  </WeatherPeriod>
                </WeatherPeriodsContainer>
                
                <Details>
                  <DetailItem>
                    <span>💨</span>
                    <span>{day.day.windSpeed}</span>
                  </DetailItem>
                  <DetailItem>
                    <span>🌧️</span>
                    <span>{Math.max(
                      day.day.probabilityOfPrecipitation?.value || 0,
                      day.night.probabilityOfPrecipitation?.value || 0
                    )}%</span>
                  </DetailItem>
                </Details>
              </DayCard>
            ))}
          </DayList>
        </ForecastCard>
      </Container>
    );
  } catch (error) {
    console.error('Error in TenDayForecast:', error);
    return (
      <Container>
        <ForecastCard>
          <h3>10-Day Forecast</h3>
          <ErrorMessage>
            An error occurred while loading the forecast
          </ErrorMessage>
        </ForecastCard>
      </Container>
    );
  }
};

export default TenDayForecast;
