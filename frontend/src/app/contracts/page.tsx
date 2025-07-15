// frontend/src/app/contracts/page.tsx - Enhanced Version with Pagination
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Pagination from '@/components/Pagination';
import ContractFilters from '@/components/ContractFilters';

interface Contract {
  id: number;
  contract_number: string;
  total_value: number | string | null;
  start_date: string;
  end_date: string;
  sign_date?: string;
  contract_type_name?: string;
  contract_status_name?: string;
  contract_status_code?: string;
  client_name?: string;
  description?: string;
  created_at?: string;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  from: number;
  to: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export default function ContractsPage() {
  const { client, isAuthenticated } = useAuth();
  const router = useRouter();
  
  // State management
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 12,
    total: 0,
    total_pages: 0,
    from: 0,
    to: 0,
    has_next_page: false,
    has_prev_page: false
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  // Fetch contracts function with debounce
  const fetchContracts = useCallback(async (
    page = 1, 
    limit = pagination.per_page,
    search = searchTerm,
    status = selectedStatus,
    sort = sortBy,
    order = sortOrder
  ) => {
    if (!client?.email) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        email: client.email,
        page: page.toString(),
        limit: limit.toString(),
        search,
        status,
        sortBy: sort,
        sortOrder: order
      });

      console.log('📋 Fetching contracts with params:', Object.fromEntries(params));
      
      const response = await fetch(`/api/contracts?${params}`);
      const data = await response.json();

      if (data.success) {
        setContracts(data.data || []);
        setPagination(data.pagination);
        console.log('✅ Contracts loaded:', data.data?.length || 0);
      } else {
        console.error('❌ Failed to fetch contracts:', data.message);
        setContracts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [client?.email, pagination.per_page, searchTerm, selectedStatus, sortBy, sortOrder]);

  // Initial load and dependency changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchContracts(1); // Reset to page 1 when filters change
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedStatus, sortBy, sortOrder]);

  // Page change handler
  const handlePageChange = (page: number) => {
    fetchContracts(page);
  };

  // Items per page change handler
  const handlePerPageChange = (perPage: number) => {
    fetchContracts(1, perPage);
  };

  // Filter handlers
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSortChange = (sort: string, order: 'asc' | 'desc') => {
    setSortBy(sort);
    setSortOrder(order);
  };

  // Helper functions
  const parseNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (amount: number | string | null) => {
    const numericAmount = parseNumber(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const getStatusColor = (statusCode?: string) => {
    switch (statusCode?.toLowerCase()) {
      case 'daduyet':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'choduyet':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'duthao':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'thuongthao':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'trinhky':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'hethan':
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statusName?: string, statusCode?: string) => {
    return statusName || statusCode || 'Không xác định';
  };

  // Contract card component
  const ContractCard = ({ contract }: { contract: Contract }) => (
    <Link 
      href={`/contracts/${contract.id}`}
      className="group block"
    >
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-blue-200 transform group-hover:-translate-y-1">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {contract.contract_number}
              </h3>
              <p className="text-sm text-gray-500">
                {contract.contract_type_name || 'Loại hợp đồng'}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.contract_status_code)}`}>
              {getStatusText(contract.contract_status_name, contract.contract_status_code)}
            </span>
          </div>

          {/* Contract Value */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Giá trị hợp đồng</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(contract.total_value)}
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(contract.start_date)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(contract.end_date)}
              </p>
            </div>
          </div>

          {/* Description (if available) */}
          {contract.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 line-clamp-2">
                {contract.description}
              </p>
            </div>
          )}

          {/* View Details Button */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Xem chi tiết</span>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  // Contract list item component
  const ContractListItem = ({ contract }: { contract: Contract }) => (
    <Link 
      href={`/contracts/${contract.id}`}
      className="group block"
    >
      <div className="bg-white border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-all duration-200 group-hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {contract.contract_number}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {contract.contract_type_name || 'Loại hợp đồng'}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-500">Giá trị</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(contract.total_value)}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(contract.start_date)}
                </p>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm text-gray-500">Ngày kết thúc</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(contract.end_date)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.contract_status_code)}`}>
              {getStatusText(contract.contract_status_name, contract.contract_status_code)}
            </span>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );

  // Loading component
  const LoadingState = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-gray-400 text-3xl">📄</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {searchTerm || selectedStatus ? 'Không tìm thấy hợp đồng' : 'Chưa có hợp đồng nào'}
        </h3>
        <p className="text-gray-500 mb-6">
          {searchTerm || selectedStatus 
            ? 'Thử thay đổi bộ lọc để tìm hợp đồng phù hợp' 
            : 'Các hợp đồng của bạn sẽ được hiển thị tại đây'
          }
        </p>
        {(searchTerm || selectedStatus) && (
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Xóa tìm kiếm
            </button>
            <button
              onClick={() => setSelectedStatus('')}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Danh sách hợp đồng
                </h1>
                <p className="text-gray-600">Quản lý và theo dõi tất cả hợp đồng của bạn</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                {/* Total count */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {pagination.total} hợp đồng
                </span>
                
                {/* View mode toggle */}
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <ContractFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            loading={loading}
          />

          {/* Content */}
          {loading ? (
            <LoadingState />
          ) : contracts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Content area */}
              <div className="p-6">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {contracts.map((contract) => (
                      <ContractCard key={contract.id} contract={contract} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contracts.map((contract) => (
                      <ContractListItem key={contract.id} contract={contract} />
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.per_page}
                onPageChange={handlePageChange}
                onPerPageChange={handlePerPageChange}
                loading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}