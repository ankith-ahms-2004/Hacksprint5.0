'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { CommodityPriceData } from '@/types/dashboard';

// Define colors for each crop in the bar chart
const cropColors: Record<string, string> = {
  rice: '#4CAF50',
  wheat: '#FFC107',
  cotton: '#03A9F4',
  maize: '#FF5722',
  tomato: '#E91E63',
  potato: '#9C27B0',
  sugarcane: '#3F51B5',
};

export default function CommodityPriceVisualization() {
  const [priceData, setPriceData] = useState<CommodityPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [selectedRegion, setSelectedRegion] = useState('karnataka');
  const [selectedRange, setSelectedRange] = useState('30d');
  
  useEffect(() => {
    const fetchCommodityPrices = async () => {
      try {
        setLoading(true);
        
        const url = `/api/commodity-prices?crop=${selectedCrop}&region=${selectedRegion}&range=${selectedRange}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch commodity prices');
        }
        
        const data = await response.json();
        setPriceData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommodityPrices();
  }, [selectedCrop, selectedRegion, selectedRange]);
  
  const formatPrice = (price: number) => `₹${price.toFixed(2)}`;
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading price data...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }
  
  if (!priceData) {
    return <div className="text-gray-500 p-4">No price data available</div>;
  }
  
  // Format data for the comparison bar chart
  const formattedComparisonData = priceData.comparisonData.map(item => ({
    ...item,
    // Ensure crop name is capitalized for display
    cropName: item.crop.charAt(0).toUpperCase() + item.crop.slice(1),
  }));
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Commodity Price Trends</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedCrop}
            onChange={e => setSelectedCrop(e.target.value)}
          >
            <option value="rice">Rice</option>
            <option value="wheat">Wheat</option>
            <option value="cotton">Cotton</option>
            <option value="maize">Maize</option>
            <option value="tomato">Tomato</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
          >
            <option value="karnataka">Karnataka</option>
            <option value="tamil nadu">Tamil Nadu</option>
            <option value="punjab">Punjab</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={selectedRange}
            onChange={e => setSelectedRange(e.target.value)}
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">3 Months</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">
            {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price Trend
            ({selectedRange === '7d' ? '7 Days' : selectedRange === '30d' ? '30 Days' : '3 Months'})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={priceData.priceHistory}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatPrice}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="price"
                  name={`${selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} Price (₹/Quintal)`}
                  stroke="#4CAF50"
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">
            Current Price Comparison (₹/Quintal)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedComparisonData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="crop" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatPrice}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number) => formatPrice(value)}
                  labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)}`}
                />
                <Legend />
                <Bar
                  dataKey="price"
                  name="Price (₹/Quintal)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  fill="#8884d8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 italic">
        Source: Real-time market data. Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
} 