// frontend/src/app/contracts/[id]/page.tsx - Updated to match DB structure
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

// Updated interface để match với database structure
interface ContractProduct {
  id: number;
  product_id?: number;
  product_name?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_unit?: string;
}

interface ContractParticipant {
  party_type: string;
  name: string;
  position?: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_code?: string;
  bank_account?: string;
  bank_name?: string;
}

interface ContractAttachment {
  id: number;
  file_name: string;
  file_path: string;
  uploaded_by: number;
  created_at: string;
}

interface ContractPayment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_status: string;
  reference_number?: string;
  created_at: string;
}

interface ContractNote {
  id: number;
  content: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

interface ContractActivity {
  activity_type: string;
  activity_name: string;
  activity_description: string;
  activity_date: string;
  actor_name: string;
}

interface ContractDetail {
  id: number;
  contract_number: string;
  contract_type_name: string;
  contract_status_name: string;
  contract_status_code: string;
  start_date: string;
  end_date: string;
  sign_date?: string;
  total_value: number;
  description?: string;
  contract_purpose?: string;
  contract_form?: string;
  pay_method?: string;
  payment_terms?: string;
  legal_basis?: string;
  payment_requirements?: string;
  pay: boolean;
  liquidation: boolean;
  
  // Client info
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  client_company?: string;
  client_tax_code?: string;
  
  // Department & Sales info
  department_name?: string;
  sales_employee_name?: string;
  sales_employee_email?: string;
  
  // Related data
  participants: ContractParticipant[];
  items: ContractProduct[];
  attachments: ContractAttachment[];
  payments: ContractPayment[];
  notes: ContractNote[];
  activities: ContractActivity[];
}

export default function ContractDetailPage({ params }: { params: { id: string } }) {
  const { client, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contract, setContract] = useState<ContractDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchContractDetail = async () => {
      if (!client?.email) return;

      try {
        console.log('📄 Fetching contract detail for ID:', params.id);
        
        const response = await fetch(`/api/contracts/${params.id}?email=${encodeURIComponent(client.email)}`);
        const data = await response.json();

        console.log('📡 API Response:', data);

        if (data.success) {
          setContract(data.data);
          setError(null);
          console.log('✅ Contract detail loaded:', data.data);
        } else {
          console.error('❌ Failed to fetch contract detail:', data.message);
          setError(data.message);
          
          // Log debug info nếu có
          if (data.debug) {
            console.log('🔍 Debug info:', data.debug);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching contract detail:', error);
        setError('Lỗi kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetail();
  }, [isAuthenticated, router, client?.email, params.id]);

  // Helper functions
  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '0 ₫';
    
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Chưa có';
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const getStatusColor = (statusCode: string) => {
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

  const calculateProgress = () => {
    if (!contract) return 0;
    
    const totalPaid = contract.payments?.reduce((sum, payment) => 
      payment.payment_status === 'completed' ? sum + payment.amount : sum, 0
    ) || 0;
    
    return Math.min((totalPaid / contract.total_value) * 100, 100);
  };

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: '📋' },
    { id: 'participants', name: 'Bên tham gia', icon: '👥' },
    { id: 'items', name: 'Sản phẩm', icon: '📦' },
    { id: 'payments', name: 'Thanh toán', icon: '💰' },
    { id: 'documents', name: 'Tài liệu', icon: '📎' },
    { id: 'activities', name: 'Hoạt động', icon: '📅' },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout>
        <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-3xl">❌</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Không tìm thấy hợp đồng'}
              </h3>
              <p className="text-gray-500 mb-6">
                Hợp đồng này không tồn tại hoặc bạn không có quyền truy cập
              </p>
              <Link
                href="/contracts"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();

  return (
    <DashboardLayout>
      <div className="p-6 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link
                href="/contracts"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại danh sách
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  {contract.contract_number}
                </h1>
                <p className="text-gray-600">{contract.contract_type_name}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(contract.contract_status_code)}`}>
                  {contract.contract_status_name}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Giá trị hợp đồng</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(contract.total_value)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tiến độ thanh toán</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {progress.toFixed(1)}%
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(contract.start_date)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">📅</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày kết thúc</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(contract.end_date)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">⏰</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Client Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Tên khách hàng</label>
                          <p className="text-sm text-gray-900 font-medium">{contract.client_name || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Email</label>
                          <p className="text-sm text-gray-900">{contract.client_email || 'Chưa cập nhật'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Điện thoại</label>
                          <p className="text-sm text-gray-900">{contract.client_phone || 'Chưa có'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Công ty</label>
                          <p className="text-sm text-gray-900">{contract.client_company || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Mã số thuế</label>
                          <p className="text-sm text-gray-900">{contract.client_tax_code || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Địa chỉ</label>
                          <p className="text-sm text-gray-900">{contract.client_address || 'Chưa có'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết hợp đồng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Mục đích hợp đồng</label>
                          <p className="text-sm text-gray-900">{contract.contract_purpose || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Hình thức hợp đồng</label>
                          <p className="text-sm text-gray-900">{contract.contract_form || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Phương thức thanh toán</label>
                          <p className="text-sm text-gray-900">{contract.pay_method || 'Chưa có'}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Ngày ký</label>
                          <p className="text-sm text-gray-900">{formatDate(contract.sign_date || '')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Bộ phận phụ trách</label>
                          <p className="text-sm text-gray-900">{contract.department_name || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Nhân viên kinh doanh</label>
                          <p className="text-sm text-gray-900">{contract.sales_employee_name || 'Chưa có'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Trạng thái thanh toán</label>
                          <p className={`text-sm font-medium ${contract.pay ? 'text-green-600' : 'text-red-600'}`}>
                            {contract.pay ? '✅ Đã thanh toán' : '❌ Chưa thanh toán'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Trạng thái thanh lý</label>
                          <p className={`text-sm font-medium ${contract.liquidation ? 'text-green-600' : 'text-orange-600'}`}>
                            {contract.liquidation ? '✅ Đã thanh lý' : '⏳ Chưa thanh lý'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  {contract.payment_terms && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khoản thanh toán</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {contract.payment_terms}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Payment Requirements */}
                  {contract.payment_requirements && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Yêu cầu thanh toán</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {contract.payment_requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Legal Basis */}
                  {contract.legal_basis && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Căn cứ pháp lý</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {contract.legal_basis}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {contract.description && (
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả hợp đồng</h3>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {contract.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'participants' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Các bên tham gia hợp đồng</h3>
                  {contract.participants && contract.participants.length > 0 ? (
                    <div className="space-y-6">
                      {contract.participants.map((participant, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Bên {participant.party_type} - {participant.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Chức vụ</label>
                              <p className="text-sm text-gray-900">{participant.position || 'Chưa có'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Điện thoại</label>
                              <p className="text-sm text-gray-900">{participant.phone || 'Chưa có'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Email</label>
                              <p className="text-sm text-gray-900">{participant.email || 'Chưa có'}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-500">Mã số thuế</label>
                              <p className="text-sm text-gray-900">{participant.tax_code || 'Chưa có'}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-500">Địa chỉ</label>
                              <p className="text-sm text-gray-900">{participant.address || 'Chưa có'}</p>
                            </div>
                            {(participant.bank_account || participant.bank_name) && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-500">Số tài khoản</label>
                                  <p className="text-sm text-gray-900">{participant.bank_account || 'Chưa có'}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-500">Ngân hàng</label>
                                  <p className="text-sm text-gray-900">{participant.bank_name || 'Chưa có'}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">👥</span>
                      </div>
                      <p className="text-gray-500">Chưa có thông tin bên tham gia</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'items' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm / Dịch vụ</h3>
                  {contract.items && contract.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tên sản phẩm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mô tả
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Đơn giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {contract.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.product_name || `Sản phẩm ${index + 1}`}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {item.description || 'Không có mô tả'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {item.quantity} {item.product_unit || ''}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.unit_price)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(item.total_price)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                              Tổng cộng:
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-900">
                              {formatCurrency(contract.items.reduce((sum, item) => sum + Number(item.total_price), 0))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">📦</span>
                      </div>
                      <p className="text-gray-500">Chưa có thông tin sản phẩm/dịch vụ</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin thanh toán</h3>
                  
                  {/* Payment Summary */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {formatCurrency(contract.total_value)}
                        </div>
                        <div className="text-sm text-gray-600">Tổng giá trị hợp đồng</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {contract.pay ? formatCurrency(contract.total_value) : '0 ₫'}
                        </div>
                        <div className="text-sm text-gray-600">Đã thanh toán</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-2">
                          {contract.pay ? '0 ₫' : formatCurrency(contract.total_value)}
                        </div>
                        <div className="text-sm text-gray-600">Còn lại</div>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  {contract.payments && contract.payments.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-gray-900">Lịch sử thanh toán</h4>
                      {contract.payments.map((payment, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-lg font-semibold text-gray-900">
                                  {formatCurrency(payment.amount)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  payment.payment_status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : payment.payment_status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {payment.payment_status === 'completed' ? 'Đã thanh toán' : 
                                   payment.payment_status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Ngày thanh toán:</span> {formatDate(payment.payment_date)}
                                </div>
                                <div>
                                  <span className="font-medium">Phương thức:</span> {payment.payment_method}
                                </div>
                                {payment.reference_number && (
                                  <div>
                                    <span className="font-medium">Mã tham chiếu:</span> {payment.reference_number}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">💰</span>
                      </div>
                      <p className="text-gray-500">
                        {contract.pay ? 'Hợp đồng đã được thanh toán' : 'Chưa có lịch sử thanh toán'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu đính kèm</h3>
                  {contract.attachments && contract.attachments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {contract.attachments.map((attachment, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 text-lg">📎</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(attachment.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <button className="w-full text-sm bg-blue-50 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
                              Tải xuống
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">📎</span>
                      </div>
                      <p className="text-gray-500">Chưa có tài liệu đính kèm</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activities' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử hoạt động</h3>
                  {contract.activities && contract.activities.length > 0 ? (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {contract.activities.map((activity, index) => (
                          <li key={index}>
                            <div className="relative pb-8">
                              {index !== contract.activities.length - 1 && (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    activity.activity_type === 'status_change' ? 'bg-blue-500' :
                                    activity.activity_type === 'payment_added' ? 'bg-green-500' :
                                    activity.activity_type === 'contract_signed' ? 'bg-purple-500' :
                                    activity.activity_type === 'note_added' ? 'bg-yellow-500' :
                                    'bg-gray-500'
                                  }`}>
                                    <span className="text-white text-xs">
                                      {activity.activity_type === 'status_change' ? '📋' :
                                       activity.activity_type === 'payment_added' ? '💰' :
                                       activity.activity_type === 'contract_signed' ? '✍️' :
                                       activity.activity_type === 'note_added' ? '📝' : '📅'}
                                    </span>
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      <span className="font-medium">{activity.activity_name}</span>
                                      {activity.activity_description && (
                                        <span className="text-gray-600"> - {activity.activity_description}</span>
                                      )}
                                    </p>
                                    {activity.actor_name && (
                                      <p className="text-xs text-gray-500">bởi {activity.actor_name}</p>
                                    )}
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    {formatDateTime(activity.activity_date)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">📅</span>
                      </div>
                      <p className="text-gray-500">Chưa có hoạt động nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}