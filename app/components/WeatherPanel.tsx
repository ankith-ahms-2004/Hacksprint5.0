'use client';

import { useState, useEffect } from 'react';
import { WeatherAdvice } from '@/types/dashboard';

// Weather icon mapping based on condition
const weatherIcons: Record<string, string> = {
  'Clear': '☀️',
  'Partly Cloudy': '⛅',
  'Cloudy': '☁️',
  'Rain': '🌧️',
  'Light Rain': '🌦️',
  'Heavy Rain': '⛈️',
  'Thunderstorm': '🌩️',
  'Snow': '❄️',
  'Fog': '🌫️',
  'Windy': '💨',
};

export default function WeatherPanel() {
  const [weatherData, setWeatherData] = useState<WeatherAdvice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // User location and crop inputs
  const [location, setLocation] = useState('');
  const [usingCurrentLocation, setUsingCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number; lon: number} | null>(null);
  const [crop, setCrop] = useState('tomato');
  
  // Get user's current location
  const getUserLocation = () => {
    setLoading(true);
    setUsingCurrentLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          setCoordinates(coords);
          setLocation('');
          fetchWeatherAdvice(undefined, coords);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get your location. Please try selecting a city instead.');
          setUsingCurrentLocation(false);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Please try selecting a city instead.');
      setUsingCurrentLocation(false);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Set a default location if none is selected
    if (!location && !coordinates) {
      setLocation('bangalore');
    }
  }, []);
  
  useEffect(() => {
    if (location && !usingCurrentLocation) {
      fetchWeatherAdvice(location);
    }
  }, [location, crop]);
  
  const fetchWeatherAdvice = async (locationName?: string, coords?: {lat: number; lon: number}) => {
    try {
      setLoading(true);
      
      const requestBody = coords 
        ? { lat: coords.lat, lon: coords.lon, crop } 
        : { location: locationName, crop };
      
      const response = await fetch('/api/weather-advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather advice');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUsingCurrentLocation(false);
    setCoordinates(null);
    setLocation(e.target.value);
  };
  
  if (loading) {
    return <div className="flex justify-center p-8 text-gray-800 font-medium text-lg">Loading weather data...</div>;
  }
  
  if (error) {
    return <div className="text-red-600 p-4 font-medium">Error: {error}</div>;
  }
  
  if (!weatherData) {
    return <div className="text-gray-700 p-4 font-medium">No weather data available</div>;
  }
  
  const { currentWeather, forecast, advice } = weatherData;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Weather & Farming Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Location</label>
          <div className="flex">
            <select
              className="w-full border-2 border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
              value={location}
              onChange={handleLocationChange}
              disabled={usingCurrentLocation}
            >
              <option value="">Select location</option>
              <option value="bangalore">Bangalore</option>
              <option value="chennai">Chennai</option>
              <option value="davangere">Davangere</option>
              <option value="hyderabad">Hyderabad</option>
              <option value="mumbai">Mumbai</option>
              <option value="delhi">Delhi</option>
              <option value="kolkata">Kolkata</option>
            </select>
            <button 
              onClick={getUserLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md flex items-center font-medium"
              title="Use my current location"
            >
              📍
            </button>
          </div>
          {usingCurrentLocation && (
            <div className="mt-1 text-sm text-green-600 font-medium">Using your current location</div>
          )}
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Crop</label>
          <select
            className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
            value={crop}
            onChange={e => {
              setCrop(e.target.value);
              if (usingCurrentLocation && coordinates) {
                fetchWeatherAdvice(undefined, coordinates);
              }
            }}
          >
            <option value="">Select crop (optional)</option>
            <option value="tomato">Tomato</option>
            <option value="rice">Rice</option>
            <option value="wheat">Wheat</option>
            <option value="cotton">Cotton</option>
            <option value="maize">Maize</option>
            <option value="potato">Potato</option>
            <option value="soybean">Soybean</option>
            <option value="sugarcane">Sugarcane</option>
          </select>
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-bold text-gray-700 mb-1">Last Updated</label>
          <div className="border-2 border-gray-300 rounded-md px-3 py-2 text-gray-700 font-medium bg-gray-50">
            {new Date(currentWeather.timestamp).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather Card */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-blue-900">Current Weather</h3>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-4xl mb-2 font-bold">
                {weatherIcons[currentWeather.condition] || '🌡️'} {currentWeather.temp}°C
              </div>
              <div className="text-blue-800 font-medium">{currentWeather.condition}</div>
              <div className="text-sm text-blue-700 font-medium">
                {new Date(currentWeather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-1">
                <span className="text-blue-800 mr-2">💧</span>
                <span className="text-gray-800 font-medium">Humidity: {currentWeather.humidity}%</span>
              </div>
              <div className="flex items-center mb-1">
                <span className="text-blue-800 mr-2">💨</span>
                <span className="text-gray-800 font-medium">Wind: {currentWeather.windSpeed} km/h</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-800 mr-2">🌧️</span>
                <span className="text-gray-800 font-medium">Rainfall: {currentWeather.rainfall} mm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 7-Day Forecast */}
        <div className="col-span-1 lg:col-span-2 bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <h3 className="text-lg font-bold mb-4 text-gray-800">7-Day Forecast</h3>
          
          <div className="grid grid-cols-7 gap-2">
            {forecast.map((day, index) => (
              <div key={index} className="bg-white p-3 rounded-md text-center min-w-[90px] border border-gray-200 shadow-sm">
                <div className="text-xs font-bold mb-1 text-gray-800">
                  {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                </div>
                <div className="text-2xl mb-1">
                  {weatherIcons[day.condition] || '🌡️'}
                </div>
                <div className="text-xs font-medium mb-1 text-gray-800">{day.condition}</div>
                <div className="text-sm font-bold text-gray-800">
                  {day.tempHigh}°C / {day.tempLow}°C
                </div>
                <div className="text-xs text-gray-700 font-medium">
                  {day.rainProbability}% rain
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* AI-powered advice */}
      <div className="mt-6 bg-green-50 p-6 rounded-lg border border-green-200 shadow-sm">
        <h3 className="text-lg font-bold mb-2 text-green-800">AI Farming Recommendation</h3>
        <p className="text-green-900 font-medium">{advice}</p>
      </div>
    </div>
  );
} 