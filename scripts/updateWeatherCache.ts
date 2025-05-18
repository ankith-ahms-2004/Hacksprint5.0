import { getCurrentWeather, get7DayForecast, getCoordinatesFromCity } from '../services/openWeatherService';

// List of major cities to prefetch weather data for
const MAJOR_CITIES = [
  'bangalore',
  'chennai',
  'delhi',
  'mumbai',
  'kolkata',
  'hyderabad',
  'davangere'
];

let weatherCache: Record<string, any> = {};

async function updateWeatherCache() {
  console.log(`[${new Date().toISOString()}] Updating weather cache...`);
  
  try {
    for (const city of MAJOR_CITIES) {
      try {
        console.log(`Fetching data for ${city}...`);
        
        const coordinates = await getCoordinatesFromCity(city);
        
        const currentWeather = await getCurrentWeather(coordinates);
        
        const forecast = await get7DayForecast(coordinates);
        
        weatherCache[city] = {
          coordinates,
          currentWeather,
          forecast,
          timestamp: Date.now()
        };
        
        console.log(`Updated data for ${city}`);
      } catch (cityError) {
        console.error(`Error updating data for ${city}:`, cityError);
      }
    }
    
    console.log('Weather cache update completed successfully');
  } catch (error) {
    console.error('Failed to update weather cache:', error);
  }
}

updateWeatherCache();

setInterval(updateWeatherCache, 60 * 60 * 1000);

export function getWeatherCache() {
  return weatherCache;
}

if (require.main === module) {
  console.log('Weather cache service started');
} 