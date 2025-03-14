import React, { useState } from 'react';
import styled from '@emotion/styled';
import { searchLocations } from '../services/weatherService';

const SearchContainer = styled.div`
  margin: 0 auto;
  max-width: 600px;
  padding: 0 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  backdrop-filter: blur(10px);
  margin-bottom: 8px;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  max-height: ${props => props.show ? '300px' : '0'};
  overflow-y: auto;
  transition: max-height 0.3s ease;
`;

const ResultItem = styled.li`
  padding: 12px 16px;
  color: white;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .location-name {
    font-weight: 500;
  }
  
  .location-details {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 2px;
  }
`;

const ErrorMessage = styled.div`
  color: #ff8080;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
  padding: 8px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
`;

const LoadingDots = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 8px;
  
  &:after {
    content: '...';
    animation: dots 1.5s steps(4, end) infinite;
  }
  
  @keyframes dots {
    0%, 20% { content: '.'; }
    40% { content: '..'; }
    60% { content: '...'; }
    80%, 100% { content: ''; }
  }
`;

const LocationSearch = ({ onLocationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.length >= 2) {
      // Add a small delay to prevent too many API calls
      const timeoutId = setTimeout(async () => {
        setIsSearching(true);
        try {
          const locations = await searchLocations(value);
          if (locations.length === 0) {
            setError('No locations found. Try a different search term.');
          }
          setResults(locations);
        } catch (error) {
          console.error('Error searching locations:', error);
          setError('Unable to search locations. Please try again.');
        } finally {
          setIsSearching(false);
        }
      }, 300);
      
      setSearchTimeout(timeoutId);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (location) => {
    const locationName = formatLocationName(location);
    setQuery(locationName);
    setResults([]);
    onLocationSelect(location);
  };

  const formatLocationName = (location) => {
    const parts = [];
    parts.push(location.name);
    
    // Add state/province if available
    if (location.admin1) {
      parts.push(location.admin1);
    }
    
    // Always add country unless it's the United States
    if (location.country !== 'United States') {
      parts.push(location.country);
    }
    
    return parts.join(', ');
  };

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search city (e.g., Chicago, Boston, London)"
        aria-label="Search location"
      />
      {isSearching && (
        <LoadingDots>Searching</LoadingDots>
      )}
      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}
      <ResultsList show={results.length > 0}>
        {results.map((result) => (
          <ResultItem
            key={`${result.latitude}-${result.longitude}`}
            onClick={() => handleSelect(result)}
          >
            <div className="location-name">{result.name}</div>
            <div className="location-details">
              {result.admin1} {result.country !== 'United States' ? `, ${result.country}` : ''}
            </div>
          </ResultItem>
        ))}
      </ResultsList>
    </SearchContainer>
  );
};

export default LocationSearch;
