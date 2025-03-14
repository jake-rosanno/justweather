import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import LocationSearch from './components/LocationSearch';
import TabNavigation from './components/TabNavigation';
import CurrentWeather from './components/CurrentWeather';
import HourlyWeather from './components/HourlyWeather';
import TenDayForecast from './components/TenDayForecast';
import { getWeatherByCoordinates } from './services/weatherService';

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1400px;
  padding: 0 20px;
  margin: 0 auto;
`;

const Header = styled.header`
  width: 100%;
  text-align: center;
  padding: 2rem 0 1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
  
  h1 {
    margin: 0 0 1rem;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: -0.5px;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
  padding: 20px;
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: ${props => props.error ? '16px' : '0'};
`;

const ErrorContainer = styled.div`
  background: rgba(255, 59, 48, 0.1);
  padding: 16px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  max-width: 600px;
  margin: 0 auto;
`;

const RetryButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [activeTab, setActiveTab] = useState('now');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const fetchWeatherData = useCallback(async (latitude, longitude) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate coordinates before making the API call
      if (!latitude || !longitude || 
          isNaN(parseFloat(latitude)) || 
          isNaN(parseFloat(longitude))) {
        throw new Error('Invalid location coordinates');
      }

      const data = await getWeatherByCoordinates(latitude, longitude);
      
      // Validate the response data
      if (!data || !data.current || !data.location) {
        throw new Error('Invalid weather data received');
      }

      setWeatherData(data);
      setCurrentLocation({ latitude, longitude });
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message || 'Error fetching weather data. Please try again later.');
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleGetLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser. Please search for a location.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Set a timeout to handle slow geolocation responses
    const timeoutId = setTimeout(() => {
      setError('Location request timed out. Please try again or search for a location.');
      setIsLoading(false);
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        clearTimeout(timeoutId);
        console.error('Geolocation error:', err);
        let errorMessage = 'Unable to get your location. ';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += 'Please enable location services or search for a location.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Please try searching for a location instead.';
        }
        
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [fetchWeatherData]);

  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  const handleLocationSelect = useCallback((location) => {
    if (!location?.latitude || !location?.longitude) {
      setError('Invalid location selected. Please try another location.');
      return;
    }
    fetchWeatherData(location.latitude, location.longitude);
  }, [fetchWeatherData]);

  const handleRetry = useCallback(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      fetchWeatherData(currentLocation.latitude, currentLocation.longitude);
    } else {
      handleGetLocation();
    }
  }, [currentLocation, fetchWeatherData, handleGetLocation]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <LoadingOverlay>
          <LoadingText>Loading weather data...</LoadingText>
        </LoadingOverlay>
      );
    }

    if (error) {
      return (
        <LoadingOverlay>
          <LoadingText error>{error}</LoadingText>
          <RetryButton onClick={handleRetry}>
            Try Again
          </RetryButton>
        </LoadingOverlay>
      );
    }

    if (!weatherData) {
      return (
        <LoadingOverlay>
          <LoadingText>Please search for a location to view weather data</LoadingText>
        </LoadingOverlay>
      );
    }

    return (
      <>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'now' && <CurrentWeather weatherData={weatherData} />}
        {activeTab === 'hourly' && <HourlyWeather weatherData={weatherData} />}
        {activeTab === 'tenday' && <TenDayForecast weatherData={weatherData} />}
      </>
    );
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <h1>justweather</h1>
          <LocationSearch onLocationSelect={handleLocationSelect} />
        </HeaderContent>
      </Header>
      <ContentWrapper>
        {renderContent()}
      </ContentWrapper>
    </AppContainer>
  );
}

export default App;
