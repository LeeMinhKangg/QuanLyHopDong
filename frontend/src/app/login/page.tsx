'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập Customer Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dành cho khách hàng của công ty
          </p>
          <p className="mt-1 text-center text-sm text-gray-600">
            Hoặc{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              đăng ký tài khoản mới
            </Link>
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="contact@company.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Backend API Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h4 className="text-sm font-medium text-blue-700 mb-2">🔧 Laravel Client API</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <div><strong>Backend:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}</div>
              <div><strong>Endpoint:</strong> /customer-portal/login</div>
              <div><strong>Database:</strong> bảng clients (không phải users)</div>
              <div className="mt-2 text-blue-700">
                ✅ Gọi Laravel API → Auth bảng clients → Trả về token
              </div>
            </div>
          </div>

          {/* Test data */}
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <h4 className="text-sm font-medium text-green-700 mb-2">💡 Test Data</h4>
            <div className="text-xs text-green-600 space-y-1">
              <div><strong>Email:</strong> microsoft@gmail.com</div>
              <div><strong>Email:</strong> apple@gmail.com</div>
              <div className="text-orange-600">
                ⚠️ Cần thêm password vào bảng clients trước
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}