import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminLogin } from '../services/admin';
import { KeyRound, ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLogin({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await adminLogin(username, password);
    if (success) {
      onLogin();
    } else {
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Button variant="ghost" onClick={onBack} className="absolute top-4 left-4">
        <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
      </Button>

      <div className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-slate-700" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Quản trị viên</h2>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập để vào hệ thống quản lý</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tên đăng nhập</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mật khẩu</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="h-12"
            />
          </div>
          <Button type="submit" disabled={isLoading || !username || !password} className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white mt-4">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
}
