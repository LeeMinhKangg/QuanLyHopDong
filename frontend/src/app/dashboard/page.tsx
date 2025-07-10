'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const { client, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contractStats, setContractStats] = useState({
    total: 0,
    totalValue: 0,
    signed: 0,
    unpaid: 0
  });
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Lấy thống kê hợp đồng
    const fetchStats = async () => {
      if (!client?.email) return;

      try {
        const response = await fetch(`/api/contracts?email=${encodeURIComponent(client.email)}`);
        const data = await response.json();

        if (data.success && data.data) {
          const contractsData = data.data;
          setContracts(contractsData);
          
          // Helper function để parse số an toàn
          const parseNumber = (value: any): number => {
            if (value === null || value === undefined || value === '') {
              return 0;
            }
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) ? 0 : parsed;
          };

          const totalValue = contractsData.reduce((sum: number, contract: any) => {
            return sum + parseNumber(contract.total_value);
          }, 0);

          setContractStats({
            total: contractsData.length,
            totalValue: totalValue,
            signed: contractsData.filter((c: any) => 
              c.contract_status_code?.toLowerCase().includes('ky') || 
              c.contract_status_code?.toLowerCase().includes('signed')
            ).length,
            unpaid: contractsData.filter((c: any) => 
              c.pay === 0 || c.pay === '0' || !c.pay
            ).length
          });
        }
      } catch (error) {
        console.error('Error fetching contract stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, router, client?.email]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Component hiển thị các hàng trong bảng tiến độ hợp đồng
  const ContractProgressRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-lg">Đang tải...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (contracts.length === 0) {
      return (
        <tr>
          <td colSpan={4} className="px-6 py-12 text-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <span className="text-gray-400 text-3xl">📄</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chưa có hợp đồng nào
              </h3>
              <p className="text-gray-500 text-lg">
                Các hợp đồng của bạn sẽ được hiển thị tại đây
              </p>
            </div>
          </td>
        </tr>
      );
    }

    // Hiển thị tối đa 4 hợp đồng gần nhất
    const displayContracts = contracts.slice(0, 4);

    return (
      <>
        {displayContracts.map((contract: any, index: number) => {
          const getStatusInfo = (statusCode: string) => {
            switch (statusCode?.toLowerCase()) {
              case 'choduyet':
                return { 
                  label: 'Chờ duyệt', 
                  color: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200',
                  progress: 20,
                  progressColor: 'from-yellow-400 to-yellow-500'
                };
              case 'daduyet':
                return { 
                  label: 'Đã duyệt', 
                  color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200',
                  progress: 40,
                  progressColor: 'from-blue-400 to-blue-500'
                };
              case 'duthao':
                return { 
                  label: 'Dự thảo', 
                  color: 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border border-purple-200',
                  progress: 60,
                  progressColor: 'from-purple-400 to-purple-500'
                };
              case 'thuongthao':
                return { 
                  label: 'Thương thảo', 
                  color: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-200',
                  progress: 80,
                  progressColor: 'from-indigo-400 to-indigo-500'
                };
              case 'trinhky':
                return { 
                  label: 'Trình ký', 
                  color: 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border border-orange-200',
                  progress: 90,
                  progressColor: 'from-orange-400 to-orange-500'
                };
              case 'daky':
              case 'signed':
                return { 
                  label: 'Đã ký', 
                  color: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200',
                  progress: 100,
                  progressColor: 'from-green-400 to-green-500'
                };
              // Các trạng thái khác (backward compatibility)
              case 'dangthuchien':
                return { 
                  label: 'Đang thực hiện', 
                  color: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200',
                  progress: 80,
                  progressColor: 'from-blue-400 to-blue-500'
                };
              case 'choxacnhan':
                return { 
                  label: 'Chờ xác nhận', 
                  color: 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200',
                  progress: 20,
                  progressColor: 'from-yellow-400 to-yellow-500'
                };
              case 'dahoanthanh':
                return { 
                  label: 'Đã hoàn thành', 
                  color: 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200',
                  progress: 100,
                  progressColor: 'from-green-400 to-green-500'
                };
              case 'tamdung':
                return { 
                  label: 'Tạm dừng', 
                  color: 'bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200',
                  progress: 45,
                  progressColor: 'from-red-400 to-red-500'
                };
              default:
                return { 
                  label: contract.contract_status_name || 'Không xác định', 
                  color: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200',
                  progress: 0,
                  progressColor: 'from-gray-400 to-gray-500'
                };
            }
          };

          const statusInfo = getStatusInfo(contract.contract_status_code);

          return (
            <tr 
              key={contract.id} 
              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {contract.contract_number || `HD-${contract.id}`}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="max-w-xs">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {contract.description || contract.contract_type_name || 'Hợp đồng'}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {contract.contract_type_name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${statusInfo.progressColor} rounded-full transition-all duration-700 ease-out shadow-sm`} 
                      style={{ 
                        width: `${statusInfo.progress}%`,
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-[45px]">
                    {statusInfo.progress}%
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </>
    );
  };

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl p-8 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Chào mừng trở lại, {client.name}! 👋
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Quản lý hợp đồng và theo dõi tiến độ một cách dễ dàng
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <span className="text-3xl">🎯</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Statistics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></span>
                Thống kê hợp đồng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Tổng hợp đồng */}
                <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng hợp đồng</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          {contractStats.total}
                        </p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl">📄</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Tổng giá trị: <span className="font-semibold text-blue-600">{formatCurrency(contractStats.totalValue)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Tổng giá trị */}
                <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng giá trị</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {formatCurrency(contractStats.totalValue)}
                        </p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl">💰</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center">
                        <span className="text-green-500 text-sm mr-1">↗️</span>
                        <span className="text-sm text-gray-600">
                          Tăng so với tháng trước
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Chưa thanh toán */}
                <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-red-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Chưa thanh toán</h3>
                        <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                          {contractStats.unpaid}
                        </p>
                      </div>
                      <div className="h-14 w-14 bg-gradient-to-br from-red-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-2xl">⚠️</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        {contractStats.total > 0 
                          ? `${Math.round((contractStats.unpaid / contractStats.total) * 100)}% tổng hợp đồng`
                          : 'Chưa có dữ liệu'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract Progress */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full mr-3"></span>
                  Tiến độ hợp đồng
                </h2>
                <Link
                  href="/contracts"
                  className="group inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300"
                >
                  Xem tất cả
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Mã hợp đồng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Tên hợp đồng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Tiến độ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <ContractProgressRows />
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full mr-3"></span>
                Hoạt động gần đây
              </h2>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <span className="text-gray-400 text-3xl">📈</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Chưa có hoạt động nào
                    </h3>
                    <p className="text-gray-500 text-lg">
                      Các hoạt động mới nhất sẽ được hiển thị tại đây
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}