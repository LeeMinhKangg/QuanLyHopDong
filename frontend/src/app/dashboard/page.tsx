'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { client, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [contractStats, setContractStats] = useState({
    total: 0,
    totalValue: 0,
    signed: 0
  });

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
          const contracts = data.data;
          
          // Helper function để parse số an toàn
          const parseNumber = (value: any): number => {
            if (value === null || value === undefined || value === '') {
              return 0;
            }
            const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(parsed) ? 0 : parsed;
          };

          const totalValue = contracts.reduce((sum: number, contract: any) => {
            return sum + parseNumber(contract.total_value);
          }, 0);

          setContractStats({
            total: contracts.length,
            totalValue: totalValue,
            signed: contracts.filter((c: any) => 
              c.contract_status_code?.toLowerCase().includes('ky') || 
              c.contract_status_code?.toLowerCase().includes('signed')
            ).length
          });
        }
      } catch (error) {
        console.error('Error fetching contract stats:', error);
      }
    };

    fetchStats();
  }, [isAuthenticated, router, client?.email]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
              <p className="text-sm text-gray-600">Chào mừng, {client.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Contract Statistics với debug info */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tổng quan hợp đồng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-semibold">📄</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Tổng số hợp đồng</h3>
                    <p className="text-2xl font-bold text-gray-900">{contractStats.total}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm font-semibold">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Tổng giá trị</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(contractStats.totalValue)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Debug: {contractStats.totalValue}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-semibold">✅</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Đã ký</h3>
                    <p className="text-2xl font-bold text-orange-600">{contractStats.signed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Phần còn lại giữ nguyên như cũ */}
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/contracts"
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <span className="text-orange-600 text-xl">📄</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Danh sách hợp đồng</h3>
                  <p className="text-sm text-gray-500">Xem tất cả hợp đồng của bạn</p>
                </div>
              </Link>

              <Link
                href="/profile"
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <span className="text-orange-600 text-xl">👤</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Thông tin cá nhân</h3>
                  <p className="text-sm text-gray-500">Cập nhật thông tin tài khoản</p>
                </div>
              </Link>

              <Link
                href="/support"
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <span className="text-orange-600 text-xl">🎧</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Hỗ trợ</h3>
                  <p className="text-sm text-gray-500">Gửi yêu cầu hỗ trợ</p>
                </div>
              </Link>

              <Link
                href="/documents"
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-orange-300 group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <span className="text-orange-600 text-xl">📁</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Tài liệu</h3>
                  <p className="text-sm text-gray-500">Quản lý tài liệu hợp đồng</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin khách hàng
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên khách hàng
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-900">{client.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-900">{client.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-900">{client.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md border">
                      <p className="text-sm text-gray-900">{client.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  Cập nhật thông tin
                </Link>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          {contractStats.total === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-2xl">🎉</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-blue-900">
                    Chào mừng đến với Customer Portal!
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Hiện tại chưa có hợp đồng nào được tạo cho tài khoản của bạn. 
                      Hợp đồng sẽ xuất hiện ở đây khi công ty tạo hợp đồng cho <strong>{client.name}</strong>.
                    </p>
                    <p className="mt-2">
                      Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/support"
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Liên hệ hỗ trợ
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}