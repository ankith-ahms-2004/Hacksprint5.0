import { NextResponse } from 'next/server';
import { 
  getCurrentWeather, 
  get7DayForecast, 
  getCoordinatesFromCity,
  Coordinates 
} from '@/services/openWeatherService';
import { generateFarmingAdvice } from '@/services/farmingAdviceService';

const weatherCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_EXPIRATION = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { location, crop, lat, lon } = body;
    
    let coordinates: Coordinates;
    
    if (!location && !(lat && lon)) {
      return NextResponse.json(
        { error: 'Either location name or coordinates (lat, lon) are required' },
        { status: 400 }
      );
    }
    
    if (lat && lon) {
      coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };
    } else {
      try {
        coordinates = await getCoordinatesFromCity(location);
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to get coordinates for the provided location' },
          { status: 400 }
        );
      }
    }
    
    const cacheKey = `${coordinates.lat},${coordinates.lon}`;
    
    const cachedData = weatherCache.get(cacheKey);
    const now = Date.now();
    
    let weatherData, forecastData;
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION) {
      weatherData = cachedData.data.currentWeather;
      forecastData = cachedData.data.forecast;
    } else {
      weatherData = await getCurrentWeather(coordinates);
      forecastData = await get7DayForecast(coordinates);
      
      weatherCache.set(cacheKey, {
        data: {
          currentWeather: weatherData,
          forecast: forecastData
        },
        timestamp: now
      });
    }
    
    const advice = await generateFarmingAdvice({
      currentWeather: weatherData,
      forecast: forecastData,
      location: location || `coordinates (${coordinates.lat},${coordinates.lon})`,
      crop
    });
    
    return NextResponse.json({
      location: location || `coordinates (${coordinates.lat},${coordinates.lon})`,
      crop,
      currentWeather: weatherData,
      forecast: forecastData,
      advice
    });
  } catch (error) {
    console.error('Error in weather-advice API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 