import axios from 'axios';

const NOAA_BASE_URL = 'https://api.weather.gov';
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Create an axios instance with proper headers and timeout for NOAA API
const noaaAxios = axios.create({
  baseURL: NOAA_BASE_URL,
  headers: {
    'User-Agent': '(justweather.com, contact@justweather.com)',
    'Accept': 'application/geo+json'
  },
  timeout: 10000,
  retries: 2,
  retryDelay: 1000
});

// Add retry interceptor
noaaAxios.interceptors.response.use(null, async (error) => {
  const config = error.config;
  
  // Only retry on network errors or 5xx server errors
  if (!config || !config.retries || 
      (error.response && error.response.status < 500 && error.response.status !== 429)) {
    return Promise.reject(error);
  }
  
  config.retries--;
  
  if (config.retries === 0) {
    return Promise.reject(error);
  }
  
  // Implement exponential backoff
  const backoff = new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, config.retryDelay * (2 - config.retries));
  });
  
  await backoff;
  return noaaAxios(config);
});

// Separate instance for geocoding API
const geocodingAxios = axios.create({
  baseURL: GEOCODING_API,
  timeout: 5000
});

// Simple in-memory cache
const cache = new Map();

const getCachedData = (key) => {
  const data = cache.get(key);
  if (!data) return null;
  
  if (Date.now() - data.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return data.value;
};

const setCachedData = (key, value) => {
  cache.set(key, {
    value,
    timestamp: Date.now()
  });
};

export const getRadarUrl = (timestamp) => {
  const time = timestamp ? new Date(timestamp) : new Date();
  const formattedTime = time.toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0]
    .slice(0, 12);
  
  return `https://tiles.radar.weather.gov/tiles/ridge/standard/${formattedTime}/CONUS-LARGE/{z}/{x}/{y}.png`;
};

export const searchLocations = async (query) => {
  try {
    const sanitizedQuery = query.trim();
    if (!sanitizedQuery) {
      return [];
    }

    const cacheKey = `locations:${sanitizedQuery}`;
    const cachedResults = getCachedData(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    const response = await geocodingAxios.get('/search', {
      params: {
        name: sanitizedQuery,
        count: 10,
        language: 'en',
        format: 'json'
      }
    });
    
    if (!response.data.results) {
      return [];
    }

    const results = response.data.results
      .filter(location => 
        location.name && 
        location.latitude && 
        location.longitude &&
        location.admin1
      )
      .map(location => ({
        name: location.name.replace(/\b\w/g, l => l.toUpperCase()),
        admin1: location.admin1 || '',
        country: location.country || '',
        latitude: parseFloat(location.latitude).toFixed(4),
        longitude: parseFloat(location.longitude).toFixed(4)
      }))
      .sort((a, b) => {
        if (a.country === 'United States' && b.country !== 'United States') return -1;
        if (b.country === 'United States' && a.country !== 'United States') return 1;
        return 0;
      })
      .slice(0, 5);

    setCachedData(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error searching locations:', error);
    throw new Error('Unable to search for locations. Please try again.');
  }
};

const validateForecastData = (data) => {
  if (!data || !data.properties) {
    throw new Error('Invalid forecast data structure');
  }

  const { periods } = data.properties;
  if (!Array.isArray(periods) || periods.length === 0) {
    throw new Error('No forecast periods available');
  }

  return {
    ...data,
    properties: {
      ...data.properties,
      periods: periods.map(period => ({
        number: period.number || 0,
        name: period.name || 'N/A',
        startTime: period.startTime || null,
        endTime: period.endTime || null,
        temperature: period.temperature !== undefined ? period.temperature : null,
        temperatureUnit: period.temperatureUnit || '°F',
        windSpeed: period.windSpeed || 'N/A',
        windDirection: period.windDirection || '',
        icon: period.icon || null,
        shortForecast: period.shortForecast || 'No forecast available',
        detailedForecast: period.detailedForecast || '',
        probabilityOfPrecipitation: {
          value: period.probabilityOfPrecipitation?.value ?? 0
        },
        relativeHumidity: {
          value: period.relativeHumidity?.value ?? null
        }
      }))
    }
  };
};

const validateHourlyData = (data) => {
  if (!data || !data.properties) {
    throw new Error('Invalid hourly data structure');
  }

  const { periods } = data.properties;
  if (!Array.isArray(periods) || periods.length === 0) {
    throw new Error('No hourly periods available');
  }

  return {
    ...data,
    properties: {
      ...data.properties,
      periods: periods.map(period => ({
        number: period.number || 0,
        startTime: period.startTime || null,
        endTime: period.endTime || null,
        temperature: period.temperature !== undefined ? period.temperature : null,
        temperatureUnit: period.temperatureUnit || '°F',
        windSpeed: period.windSpeed || 'N/A',
        windDirection: period.windDirection || '',
        icon: period.icon || null,
        shortForecast: period.shortForecast || 'No forecast available',
        probabilityOfPrecipitation: {
          value: period.probabilityOfPrecipitation?.value ?? 0
        },
        relativeHumidity: {
          value: period.relativeHumidity?.value ?? null
        }
      }))
    }
  };
};

export const getWeatherByCoordinates = async (latitude, longitude) => {
  try {
    // Validate coordinates
    if (!latitude || !longitude || 
        latitude < -90 || latitude > 90 || 
        longitude < -180 || longitude > 180) {
      throw new Error('Invalid coordinates provided');
    }

    // Round coordinates to 4 decimal places
    const lat = parseFloat(latitude).toFixed(4);
    const lon = parseFloat(longitude).toFixed(4);

    // Check cache first
    const cacheKey = `weather:${lat},${lon}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // First, get the grid points for the location
    const pointResponse = await noaaAxios.get(`/points/${lat},${lon}`);
    
    if (!pointResponse.data || !pointResponse.data.properties) {
      throw new Error('Unable to find weather data for this location');
    }

    const { 
      gridId, 
      gridX, 
      gridY,
      forecast: forecastUrl,
      forecastHourly: hourlyUrl,
      forecastGridData: extendedUrl,
      observationStations: stationsUrl
    } = pointResponse.data.properties;

    // Get forecast data using the URLs provided by the points endpoint
    const [forecastResponse, hourlyResponse, extendedResponse, stationsResponse] = await Promise.allSettled([
      noaaAxios.get(forecastUrl),
      noaaAxios.get(hourlyUrl),
      noaaAxios.get(extendedUrl),
      noaaAxios.get(stationsUrl)
    ]);

    // Handle potential partial failures
    const results = {
      forecast: null,
      hourly: null,
      extended: null,
      current: null
    };

    if (forecastResponse.status === 'fulfilled') {
      results.forecast = validateForecastData(forecastResponse.value.data).properties;
    }

    if (hourlyResponse.status === 'fulfilled') {
      results.hourly = validateHourlyData(hourlyResponse.value.data).properties;
    }

    if (extendedResponse.status === 'fulfilled') {
      results.extended = extendedResponse.value.data.properties;
    }

    if (stationsResponse.status === 'fulfilled' && 
        stationsResponse.value.data.features?.length > 0) {
      const nearestStation = stationsResponse.value.data.features[0];
      try {
        const observationsResponse = await noaaAxios.get(
          `${NOAA_BASE_URL}/stations/${nearestStation.properties.stationIdentifier}/observations/latest`
        );
        results.current = observationsResponse.data.properties;
      } catch (error) {
        console.error('Error fetching current conditions:', error);
      }
    }

    // Ensure we have minimum required data
    if (!results.forecast && !results.hourly) {
      throw new Error('Unable to fetch weather data. Please try again later.');
    }

    // Format the location data
    const locationProps = pointResponse.data.properties.relativeLocation.properties;
    const weatherData = {
      ...results,
      location: {
        city: locationProps.city.replace(/\b\w/g, l => l.toUpperCase()),
        state: locationProps.state,
        distance: locationProps.distance.value,
        bearing: locationProps.bearing.value
      },
      coordinates: { latitude: lat, longitude: lon }
    };

    // Cache the results
    setCachedData(cacheKey, weatherData);
    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Handle specific API errors
    if (error.response) {
      switch (error.response.status) {
        case 404:
          throw new Error('Weather data is not available for this location');
        case 429:
          throw new Error('Too many requests. Please try again in a moment');
        case 500:
          throw new Error('Weather service is temporarily unavailable');
        default:
          throw new Error('Unable to fetch weather data. Please try again later');
      }
    }
    
    // Handle network or timeout errors
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please check your connection and try again');
    }
    
    throw error;
  }
};
