'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { DiseaseLog } from '@/types/dashboard';

const columnHelper = createColumnHelper<DiseaseLog>();

const columns = [
  columnHelper.accessor('cropName', {
    header: 'CROP',
    cell: info => <span className="font-medium text-gray-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor('diseaseName', {
    header: 'DISEASE',
    cell: info => <span className="font-medium text-gray-800">{info.getValue()}</span>,
  }),
  columnHelper.accessor('diagnosisDate', {
    header: 'DIAGNOSIS DATE',
    cell: info => <span className="font-medium text-gray-800">{new Date(info.getValue()).toLocaleDateString()}</span>,
  }),
  columnHelper.accessor('severity', {
    header: 'SEVERITY',
    cell: info => {
      const severity = info.getValue();
      const color = 
        severity === 'High' ? 'text-white bg-red-500 font-bold' : 
        severity === 'Medium' ? 'text-white bg-yellow-500 font-bold' : 
        'text-white bg-green-500 font-bold';
      
      return (
        <span className={`px-3 py-1 rounded-full text-sm ${color}`}>
          {severity}
        </span>
      );
    },
  }),
  columnHelper.accessor('region', {
    header: 'REGION',
    cell: info => <span className="font-medium text-gray-800">{info.getValue()}</span>,
  }),
];

export default function DiseaseLogsPanel() {
  const [data, setData] = useState<DiseaseLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Filters
  const [cropFilter, setCropFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Unique values for filter dropdowns
  const [uniqueCrops, setUniqueCrops] = useState<string[]>([]);
  const [uniqueRegions, setUniqueRegions] = useState<string[]>([]);

  useEffect(() => {
    const fetchDiseaseLogs = async () => {
      try {
        setLoading(true);
        
        let url = '/api/disease-logs';
        const params = new URLSearchParams();
        
        if (cropFilter) params.append('crop', cropFilter);
        if (regionFilter) params.append('region', regionFilter);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch disease logs');
        }
        
        const logs = await response.json();
        setData(logs);
        
        // Extract unique values for filters
        const crops = [...new Set(logs.map((log: DiseaseLog) => log.cropName))];
        const regions = [...new Set(logs.map((log: DiseaseLog) => log.region))];
        
        setUniqueCrops(crops);
        setUniqueRegions(regions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDiseaseLogs();
  }, [cropFilter, regionFilter, startDate, endDate]);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return <div className="flex justify-center p-8 text-gray-800 font-medium text-lg">Loading disease logs...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4 font-medium">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Disease Diagnosis Logs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Crop</label>
          <select
            className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
            value={cropFilter}
            onChange={e => setCropFilter(e.target.value)}
          >
            <option value="">All Crops</option>
            {uniqueCrops.map(crop => (
              <option key={crop} value={crop}>{crop}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Region</label>
          <select
            className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
            value={regionFilter}
            onChange={e => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {uniqueRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            className="w-full border-2 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {
                      {
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null
                    }
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 border-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            className="px-4 py-2 border-2 rounded-md font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
        <span className="text-sm font-medium text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
} 