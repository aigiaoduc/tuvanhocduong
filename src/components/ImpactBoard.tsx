import React, { useEffect, useState } from 'react';
import { fetchImpactStats, ImpactStat } from '../services/sheet';
import { TrendingUp, MessageCircleHeart, Mail, Users, Heart, Calendar } from 'lucide-react';

export default function ImpactBoard() {
  const [stats, setStats] = useState<ImpactStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchImpactStats();
      setStats(data);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate totals
  const totals = stats.reduce(
    (acc, curr) => ({
      chatCount: acc.chatCount + curr.chatCount,
      reportCount: acc.reportCount + curr.reportCount,
      parentCount: acc.parentCount + curr.parentCount,
      gratitudeCount: acc.gratitudeCount + curr.gratitudeCount,
    }),
    { chatCount: 0, reportCount: 0, parentCount: 0, gratitudeCount: 0 }
  );

  const formatMonth = (dateStr: string) => {
    // Remove timezone name like "(Giờ Đông Dương)" to ensure better cross-browser parsing
    const cleanDateStr = dateStr.replace(/\s*\(.*?\)\s*/g, '');
    const date = new Date(cleanDateStr);
    if (!isNaN(date.getTime())) {
      return `Tháng ${date.getMonth() + 1} Năm ${date.getFullYear()}`;
    }
    
    const match = dateStr.match(/(\d{1,2})\/(\d{4})/);
    if (match) {
      return `Tháng ${match[1]} Năm ${match[2]}`;
    }
    
    return dateStr;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-800">Con Số Ấn Tượng</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Cùng nhìn lại những con số biết nói, minh chứng cho sự tin tưởng và đồng hành của các bạn học sinh cùng hệ thống Tư vấn Tâm lý Học đường.
        </p>
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <MessageCircleHeart className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <p className="text-blue-100 font-medium mb-2 uppercase tracking-wider text-sm">Tư vấn AI</p>
            <p className="text-5xl font-bold mb-2">{totals.chatCount.toLocaleString()}</p>
            <p className="text-blue-100 text-sm">Cuộc trò chuyện</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <Mail className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-2 uppercase tracking-wider text-sm">Thư Hỗ Trợ</p>
            <p className="text-5xl font-bold mb-2">{totals.reportCount.toLocaleString()}</p>
            <p className="text-indigo-100 text-sm">Thư đã gửi</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <p className="text-pink-100 font-medium mb-2 uppercase tracking-wider text-sm">Biết Ơn</p>
            <p className="text-5xl font-bold mb-2">{totals.gratitudeCount.toLocaleString()}</p>
            <p className="text-pink-100 text-sm">Lời nhắn gửi</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <p className="text-emerald-100 font-medium mb-2 uppercase tracking-wider text-sm">Phụ Huynh</p>
            <p className="text-5xl font-bold mb-2">{totals.parentCount.toLocaleString()}</p>
            <p className="text-emerald-100 text-sm">Lượt sử dụng</p>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Chi tiết theo tháng
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Tháng Năm</th>
                <th className="px-6 py-4 font-medium text-right">Tư vấn AI</th>
                <th className="px-6 py-4 font-medium text-right">Thư Hỗ Trợ</th>
                <th className="px-6 py-4 font-medium text-right">Biết Ơn</th>
                <th className="px-6 py-4 font-medium text-right">Phụ Huynh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((stat, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{formatMonth(stat.month)}</td>
                  <td className="px-6 py-4 text-right font-medium text-blue-600">{stat.chatCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-indigo-600">{stat.reportCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-pink-600">{stat.gratitudeCount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-medium text-emerald-600">{stat.parentCount.toLocaleString()}</td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Chưa có dữ liệu thống kê.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
