// frontend/src/components/ContractFilters.tsx
'use client';

import { useState, useEffect } from 'react';

interface ContractFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  loading?: boolean;
}

interface ContractStatus {
  code: string;
  name: string;
}

export default function ContractFilters({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  loading = false
}: ContractFiltersProps) {
  
  const [statuses, setStatuses] = useState<ContractStatus[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch contract statuses for filter
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await fetch('/api/contracts?action=get-statuses');
        const data = await response.json();
        if (data.success) {
          setStatuses(data.data);
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };
    fetchStatuses();
  }, []);

  const sortOptions = [
    { value: 'created_at', label: 'Ngày tạo' },
    { value: 'contract_number', label: 'Số hợp đồng' },
    { value: 'total_value', label: 'Giá trị' },
    { value: 'start_date', label: 'Ngày bắt đầu' },
    { value: 'end_date', label: 'Ngày kết thúc' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
      {/* Main search bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo số hợp đồng, loại hợp đồng, mô tả..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Bộ lọc nâng cao
          <svg className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái hợp đồng
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((status) => (
                <option key={status.code} value={status.code}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sắp xếp theo
            </label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value, sortOrder)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự
            </label>
            <select
              value={sortOrder}
              onChange={(e) => onSortChange(sortBy, e.target.value as 'asc' | 'desc')}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {(selectedStatus || searchTerm) && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-600">Bộ lọc đang áp dụng:</span>
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Tìm kiếm: "{searchTerm}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {selectedStatus && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Trạng thái: {statuses.find(s => s.code === selectedStatus)?.name}
              <button
                onClick={() => onStatusChange('')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}