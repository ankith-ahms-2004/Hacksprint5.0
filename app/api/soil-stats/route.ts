import { NextResponse } from 'next/server';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  const currentSoilHealth = {
    ph: 6.8,
    nitrogen: 75, 
    phosphorus: 35,
    potassium: 210, 
    organicMatter: 3.2, 
    texture: 'Loamy',
    moisture: 42, 
    lastUpdated: new Date().toISOString()
  };
  
  const historicalData = getHistoricalSoilData(userId);
  
  return NextResponse.json({
    userId,
    currentSoilHealth,
    historicalData,
    recommendations: generateRecommendations(currentSoilHealth)
  });
}

function getHistoricalSoilData(userId: string) {
  const today = new Date();
  const data = [];
  
  for (let i = 1; i <= 6; i++) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);
    
    const phVariance = (Math.random() * 0.6) - 0.3; 
    const nutrientVariance = Math.random() * 0.2 - 0.1;
    
    data.push({
      date: date.toISOString().split('T')[0],
      ph: 6.8 + phVariance,
      nitrogen: Math.round(75 * (1 + nutrientVariance)),
      phosphorus: Math.round(35 * (1 + nutrientVariance)),
      potassium: Math.round(210 * (1 + nutrientVariance)),
      organicMatter: parseFloat((3.2 * (1 + (nutrientVariance / 2))).toFixed(1)),
      moisture: Math.round(40 + (Math.random() * 10))
    });
  }
  
  return data;
}

function generateRecommendations(soilData: any) {
  const recommendations = [];
  
  if (soilData.ph < 6.0) {
    recommendations.push('Soil pH is too acidic. Consider applying agricultural lime to raise pH to the 6.5-7.0 range for optimal nutrient availability.');
  } else if (soilData.ph > 7.5) {
    recommendations.push('Soil pH is too alkaline. Consider adding organic matter like compost or sulfur to gradually lower pH.');
  }
  
  if (soilData.nitrogen < 60) {
    recommendations.push('Nitrogen levels are low. Consider applying a nitrogen-rich fertilizer or incorporating legumes into your crop rotation.');
  }
  
  if (soilData.phosphorus < 25) {
    recommendations.push('Phosphorus levels are low. Add bone meal or rock phosphate to improve phosphorus content.');
  }
  
  if (soilData.potassium < 150) {
    recommendations.push('Potassium levels are low. Consider applying wood ash or a potassium-specific fertilizer.');
  }
  
  if (soilData.organicMatter < 2.5) {
    recommendations.push('Organic matter is low. Incorporate compost, manure, or practice cover cropping to improve soil structure and fertility.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Your soil health parameters are within optimal ranges. Continue your current soil management practices.');
  }
  
  return recommendations;
} 