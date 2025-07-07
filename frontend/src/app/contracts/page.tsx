'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Contract {
  id: number;
  contract_number: string;
  total_value: number | string | null; // Có thể là string hoặc null từ DB
  start_date: string;
  end_date: string;
  sign_date?: string;
  contract_type_name?: string;
  contract_status_name?: string;
  contract_status_code?: string;
  client_name?: string;
  description?: string;
}

export default function ContractsPage() {
  const { client, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchContracts = async () => {
      if (!client?.email) return;

      try {
        console.log('📋 Fetching contracts for email:', client.email);
        
        const response = await fetch(`/api/contracts?email=${encodeURIComponent(client.email)}`);
        const data = await response.json();

        console.log('📡 API Response:', data);

        if (data.success) {
          setContracts(data.data || []);
          console.log('✅ Contracts loaded:', data.data?.length || 0);
        } else {
          console.error('❌ Failed to fetch contracts:', data.message);
        }
      } catch (error) {
        console.error('❌ Error fetching contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContracts();
  }, [isAuthenticated, router, client?.email]);

  // Helper function để parse số an toàn
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

  const getStatusColor = (statusName?: string) => {
    if (!statusName) return 'bg-gray-100 text-gray-800';
    
    const status = statusName.toLowerCase();
    if (status.includes('ký') || status.includes('signed')) {
      return 'bg-green-100 text-green-800';
    } else if (status.includes('duyệt') || status.includes('pending')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status.includes('thảo') || status.includes('draft')) {
      return 'bg-gray-100 text-gray-800';
    } else if (status.includes('thương thảo') || status.includes('negotiating')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const filteredContracts = contracts.filter(contract =>
    contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contract_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.contract_status_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tính toán stats an toàn
  const totalValue = contracts.reduce((sum, contract) => {
    const value = parseNumber(contract.total_value);
    return sum + value;
  }, 0);

  const signedCount = contracts.filter(c => 
    c.contract_status_name?.toLowerCase().includes('ký') || 
    c.contract_status_name?.toLowerCase().includes('signed')
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải danh sách hợp đồng...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-orange-600 hover:text-orange-500">
                ← Quay lại Dashboard
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Danh sách hợp đồng</h1>
                <p className="text-sm text-gray-600">Email: {client?.email}</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {client?.name}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm theo số hợp đồng, loại hợp đồng, trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Tổng số hợp đồng</h3>
              <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Tổng giá trị</h3>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalValue)}
              </p>
              {/* Debug info */}
              <p className="text-xs text-gray-400 mt-1">
                Debug: {totalValue.toLocaleString('vi-VN')} VND
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500">Đã ký</h3>
              <p className="text-2xl font-bold text-orange-600">{signedCount}</p>
            </div>
          </div>

          {/* Debug Section - Chỉ hiển thị khi có contracts */}
          {contracts.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">🔍 Debug Info:</h4>
              <div className="text-xs text-yellow-700 space-y-1">
                {contracts.map((contract, index) => (
                  <div key={index}>
                    Contract {contract.contract_number}: 
                    Raw value: "{contract.total_value}" (type: {typeof contract.total_value}) 
                    → Parsed: {parseNumber(contract.total_value)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contracts List */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-2">
                  {searchTerm ? 'Không tìm thấy hợp đồng nào' : 'Chưa có hợp đồng nào'}
                </div>
                {!searchTerm && (
                  <p className="text-sm text-gray-400">
                    Hợp đồng sẽ xuất hiện ở đây khi có hợp đồng được tạo cho email: <strong>{client?.email}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loại hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá trị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày bắt đầu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày ký
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.contract_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {contract.contract_type_name || 'Chưa phân loại'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(contract.total_value)}
                          <br />
                          <span className="text-xs text-gray-400">
                            Raw: {contract.total_value}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.contract_status_name)}`}>
                            {contract.contract_status_name || 'Chưa xác định'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(contract.start_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(contract.sign_date || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => alert(`Chi tiết hợp đồng ${contract.contract_number}`)}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => alert(`Tài liệu hợp đồng ${contract.contract_number}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Tài liệu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}