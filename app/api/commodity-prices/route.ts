import { NextResponse } from 'next/server';


const generatePriceData = (crop: string, region: string, days: number) => {
  const prices = [];
  const today = new Date();
  const basePrice = getBasePriceForCrop(crop);
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const variance = Math.random() * 0.1 - 0.05; 
    const regionalFactor = getRegionalFactor(region, crop);
    const price = basePrice * (1 + variance) * regionalFactor;
    
    prices.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return prices;
};

const getBasePriceForCrop = (crop: string): number => {
  const prices: {[key: string]: number} = {
    'rice': 2100,
    'wheat': 1950,
    'cotton': 6200,
    'maize': 1800,
    'tomato': 2500,
    'potato': 1600,
    'sugarcane': 380
  };
  
  return prices[crop.toLowerCase()] || 2000;
};

const getRegionalFactor = (region: string, crop: string): number => {
  const factors: {[key: string]: {[key: string]: number}} = {
    'karnataka': { 'rice': 1.05, 'wheat': 0.95, 'cotton': 1.0, 'default': 1.0 },
    'tamil nadu': { 'rice': 1.1, 'cotton': 0.9, 'default': 1.0 },
    'punjab': { 'wheat': 1.15, 'rice': 1.0, 'default': 1.0 },
    'default': { 'default': 1.0 }
  };
  
  const regionFactors = factors[region.toLowerCase()] || factors['default'];
  return regionFactors[crop.toLowerCase()] || regionFactors['default'];
};

const getTodayPricesForMultipleCrops = (crops: string[], region: string) => {
  return crops.map(crop => ({
    crop,
    price: getBasePriceForCrop(crop) * getRegionalFactor(region, crop)
  }));
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop') || 'rice';
  const region = searchParams.get('region') || 'karnataka';
  const range = searchParams.get('range') || '30d';
  
  let days = 30;
  if (range === '7d') days = 7;
  if (range === '90d') days = 90;
  
  const priceData = generatePriceData(crop, region, days);
  
  const comparisonCrops = ['rice', 'wheat', 'cotton', 'maize', 'tomato'];
  const todayPrices = getTodayPricesForMultipleCrops(comparisonCrops, region);
  
  return NextResponse.json({
    crop,
    region,
    range,
    priceHistory: priceData,
    comparisonData: todayPrices
  });
} 