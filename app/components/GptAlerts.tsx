'use client';

import { useState, useEffect } from 'react';
import { GptAlert } from '@/types/dashboard';
import { getWithAuth } from '@/utils/api';

// Alert icon based on type
const alertIcons: Record<string, string> = {
  'disease': '🦠',
  'price': '💰',
  'weather': '☂️',
  'policy': '📜',
};

// Alert severity colors
const severityColors: Record<string, Record<string, string>> = {
  'high': {
    border: 'border-red-500',
    bg: 'bg-red-50',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-800',
  },
  'medium': {
    border: 'border-yellow-500',
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  'low': {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
  },
};

export default function GptAlerts() {
  const [alerts, setAlerts] = useState<GptAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        const response = await getWithAuth('/api/gpt-alerts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch GPT alerts');
        }
        
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Poll for new alerts every 5 minutes
    const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };
  
  if (loading) {
    return <div className="flex justify-center p-4">Loading alerts...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }
  
  if (alerts.length === 0) {
    return <div className="text-gray-500 p-4">No alerts available</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Smart AI Alerts</h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Powered by GPT
        </span>
      </div>
      
      <div className="p-4 max-h-96 overflow-y-auto">
        {alerts.map(alert => {
          const severity = severityColors[alert.severity] || severityColors.medium;
          
          return (
            <div 
              key={alert.id} 
              className={`mb-4 p-4 rounded-lg border-l-4 ${severity.border} ${severity.bg}`}
            >
              <div className="flex justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{alertIcons[alert.type] || '🔔'}</span>
                  <div>
                    <div className="flex items-center">
                      <span className={`text-sm ${severity.text} font-medium`}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                      </span>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${severity.badge}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className={`mt-1 ${severity.text}`}>{alert.message}</p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                  {getRelativeTime(alert.created)}
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {alert.crops.map(crop => (
                  crop !== 'All' && (
                    <span key={crop} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {crop}
                    </span>
                  )
                ))}
                
                {alert.regions.map(region => (
                  region !== 'All India' && (
                    <span key={region} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {region}
                    </span>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 