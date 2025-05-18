'use client';

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { SoilStatsData, SoilHealth } from '@/types/dashboard';

// Generate random user ID for demo purposes
const demoUserId = 'user123';

export default function SoilHealthPanel() {
  const [soilData, setSoilData] = useState<SoilStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchSoilData = async () => {
      try {
        setLoading(true);
        
        const url = `/api/soil-stats?userId=${demoUserId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch soil health data');
        }
        
        const data = await response.json();
        setSoilData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSoilData();
  }, []);
  
  // Determine pH status color based on value
  const getPHStatusColor = (ph: number) => {
    if (ph < 5.5) return 'text-red-600';
    if (ph < 6.0) return 'text-yellow-600';
    if (ph <= 7.5) return 'text-green-600';
    if (ph < 8.0) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Generate soil health historical data for charts
  const prepareSoilHistoryData = (historicalData: SoilHealth[]) => {
    return historicalData.map(entry => ({
      date: entry.date,
      ph: entry.ph,
      nitrogen: entry.nitrogen,
      phosphorus: entry.phosphorus,
      potassium: entry.potassium,
      organicMatter: entry.organicMatter
    }));
  };
  
  // Format NPK data for radar chart
  const prepareNPKData = (currentSoilHealth: SoilHealth) => {
    // Normalize values for radar chart (0-100 scale)
    const normalizeNitrogen = Math.min(100, (currentSoilHealth.nitrogen / 100) * 100);
    const normalizePhosphorus = Math.min(100, (currentSoilHealth.phosphorus / 50) * 100);
    const normalizePotassium = Math.min(100, (currentSoilHealth.potassium / 250) * 100);
    const normalizeOrganicMatter = Math.min(100, (currentSoilHealth.organicMatter / 5) * 100);
    
    return [
      { subject: 'Nitrogen', A: normalizeNitrogen, fullMark: 100 },
      { subject: 'Phosphorus', A: normalizePhosphorus, fullMark: 100 },
      { subject: 'Potassium', A: normalizePotassium, fullMark: 100 },
      { subject: 'Organic Matter', A: normalizeOrganicMatter, fullMark: 100 }
    ];
  };
  
  if (loading) {
    return <div className="flex justify-center p-8 text-gray-800 font-medium text-lg">Loading soil health data...</div>;
  }
  
  if (error) {
    return <div className="text-red-600 p-4 font-medium">Error: {error}</div>;
  }
  
  if (!soilData) {
    return <div className="text-gray-700 p-4 font-medium">No soil health data available</div>;
  }
  
  const { currentSoilHealth, historicalData, recommendations } = soilData;
  const npkData = prepareNPKData(currentSoilHealth);
  const historyChartData = prepareSoilHistoryData(historicalData);
  
  // Calculate pH progress percentage (for scale 0-14, 7 is neutral)
  const phPercentage = (currentSoilHealth.ph / 14) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Soil Health Overview</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* pH Meter */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Soil pH Level</h3>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-bold inline-block py-1 px-2 uppercase rounded-full bg-blue-200 text-blue-800">
                  Current pH
                </span>
              </div>
              <div className={`text-2xl font-bold ${getPHStatusColor(currentSoilHealth.ph)}`}>
                {currentSoilHealth.ph.toFixed(1)}
              </div>
            </div>
            
            {/* pH scale with gradient */}
            <div className="h-4 bg-gradient-to-r from-red-500 via-green-500 to-red-500 rounded-full">
              <div className="relative">
                {/* pH indicator marker - increased width and height for better visibility */}
                <div 
                  className="absolute bottom-full w-5 h-7 bg-gray-800 border-2 border-white shadow-md rounded-sm" 
                  style={{ left: `${phPercentage}%`, transform: 'translateX(-50%)' }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-sm font-semibold mt-1 text-gray-800">
              <span>Acidic (0)</span>
              <span>Neutral (7)</span>
              <span>Alkaline (14)</span>
            </div>
            
            <div className="mt-3 text-base font-bold">
              <span className={getPHStatusColor(currentSoilHealth.ph)}>
                {currentSoilHealth.ph < 6.0 ? 'Acidic' :
                 currentSoilHealth.ph <= 7.5 ? 'Optimal' : 'Alkaline'} soil pH
              </span>
            </div>
          </div>
        </div>
        
        {/* NPK Balance Radar Chart */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800">NPK & Organic Matter</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={80} data={npkData}>
                <PolarGrid stroke="#9CA3AF" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#1F2937', fontSize: 13, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#1F2937', fontSize: 12 }} />
                <Radar
                  name="Nutrient Levels"
                  dataKey="A"
                  stroke="#22C55E"
                  fill="#22C55E"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={{ fontWeight: 'bold', border: '2px solid #E5E7EB', fontSize: '14px' }} />
                <Legend formatter={(value) => <span className="font-bold text-gray-800">{value}</span>} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm font-semibold text-gray-800">
            <div>Nitrogen: <span className="font-bold">{currentSoilHealth.nitrogen} ppm</span></div>
            <div>Phosphorus: <span className="font-bold">{currentSoilHealth.phosphorus} ppm</span></div>
            <div>Potassium: <span className="font-bold">{currentSoilHealth.potassium} ppm</span></div>
            <div>Organic Matter: <span className="font-bold">{currentSoilHealth.organicMatter}%</span></div>
          </div>
        </div>
        
        {/* Historical Soil Data */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-gray-800">pH Trend</h3>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyChartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 600 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis domain={[5, 8]} tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 600 }} />
                <Tooltip contentStyle={{ fontWeight: 'bold', border: '2px solid #E5E7EB', fontSize: '14px' }} labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                <Legend formatter={(value) => <span className="font-bold text-gray-800 text-base">{value}</span>} />
                <Line
                  type="monotone"
                  dataKey="ph"
                  name="pH Level"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4F46E5', stroke: '#4F46E5' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recommendations - improved contrast with darker background and text */}
      <div className="mt-6 bg-amber-100 p-5 rounded-lg border border-amber-300 shadow-sm">
        <h3 className="text-lg font-bold mb-3 text-amber-900">Soil Recommendations</h3>
        
        <ul className="list-disc pl-5 space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="text-amber-950 font-semibold text-base">{recommendation}</li>
          ))}
        </ul>
      </div>
      
      <div className="mt-4 text-sm font-semibold text-gray-700">
        Last soil test: {new Date(currentSoilHealth.lastUpdated || '').toLocaleDateString()}
      </div>
    </div>
  );
} 