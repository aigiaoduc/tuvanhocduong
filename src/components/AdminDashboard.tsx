import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchAllData, deleteRow, updateReportStatus } from '../services/admin';
import { LogOut, Trash2, Edit, RefreshCw, BarChart3, MessageSquare, ShieldAlert, Heart, Users, Eye, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modals state
  const [viewingChat, setViewingChat] = useState<{ type: string, content: string, sender?: string, receiver?: string } | null>(null);
  const [editingReport, setEditingReport] = useState<{ rowIndex: number, currentReply: string } | null>(null);
  const [replyText, setReplyText] = useState('');

  const [deletingItem, setDeletingItem] = useState<{ sheetName: string, rowIndex: number } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchAllData();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmDelete = async () => {
    if (!deletingItem) return;
    const itemToDelete = deletingItem;
    setDeletingItem(null); // Close modal first
    setIsProcessing(true);
    await deleteRow(itemToDelete.sheetName, itemToDelete.rowIndex);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadData();
    setIsProcessing(false);
  };

  const submitReply = async () => {
    if (!editingReport) return;
    const { rowIndex } = editingReport;
    const textToSave = replyText;
    setEditingReport(null); // Close modal first
    setIsProcessing(true);
    await updateReportStatus(rowIndex, textToSave);
    await new Promise(resolve => setTimeout(resolve, 1500));
    await loadData();
    setIsProcessing(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mb-4" />
          <p>Đang tải dữ liệu hệ thống...</p>
        </div>
      </div>
    );
  }

  const stats = data ? {
    counseling: data.counseling?.length || 0,
    reports: data.reports?.length || 0,
    gratitude: data.gratitude?.length || 0,
    parents: data.parentCounseling?.length || 0
  } : { counseling: 0, reports: 0, gratitude: 0, parents: 0 };

  const reportStatusData = data?.reports.reduce((acc: any, row: any) => {
    const reply = row[5] || '';
    const isDefault = reply.includes('Cô đã tiếp nhận thông tin');
    const status = isDefault ? 'Chưa xử lý' : 'Đã xử lý';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(reportStatusData || {}).map(key => ({
    name: key,
    value: reportStatusData[key]
  }));

  const COLORS = ['#ef4444', '#10b981']; // Red for Chưa xử lý, Green for Đã xử lý

  const barData = [
    { name: 'Tư vấn HS', count: stats.counseling },
    { name: 'Báo cáo', count: stats.reports },
    { name: 'Biết ơn', count: stats.gratitude },
    { name: 'Phụ huynh', count: stats.parents },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Đang xử lý dữ liệu</h3>
            <p className="text-sm text-slate-500 text-center">Vui lòng chờ trong giây lát, hệ thống đang đồng bộ với máy chủ...</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col z-10">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6" /> Admin Panel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <BarChart3 className="w-5 h-5" /> Tổng quan
          </button>
          <button onClick={() => setActiveTab('counseling')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'counseling' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <MessageSquare className="w-5 h-5" /> Tư vấn Học sinh
          </button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <ShieldAlert className="w-5 h-5" /> Thư Hỗ Trợ
          </button>
          <button onClick={() => setActiveTab('gratitude')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'gratitude' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <Heart className="w-5 h-5" /> Hộp Thư Biết Ơn
          </button>
          <button onClick={() => setActiveTab('parent')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'parent' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <Users className="w-5 h-5" /> Tư vấn Phụ huynh
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold text-slate-800 capitalize">
            {activeTab === 'dashboard' ? 'Tổng quan hệ thống' : 
             activeTab === 'counseling' ? 'Lịch sử Tư vấn Học sinh' : 
             activeTab === 'reports' ? 'Quản lý Thư Hỗ Trợ' : 
             activeTab === 'gratitude' ? 'Hộp Thư Biết Ơn' : 'Tư vấn Phụ huynh'}
          </h2>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading || isProcessing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-8 relative">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Tư vấn Học sinh</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.counseling}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Thư Hỗ Trợ</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.reports}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Thư Biết Ơn</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.gratitude}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm font-medium text-slate-500 mb-1">Tư vấn Phụ huynh</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.parents}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Thống kê tương tác</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Tỷ lệ xử lý Thư Hỗ Trợ</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                    <tr>
                      <th className="px-6 py-4">Thời gian</th>
                      {activeTab === 'counseling' && (
                        <>
                          <th className="px-6 py-4">Session ID</th>
                          <th className="px-6 py-4">Danh tính</th>
                          <th className="px-6 py-4">Loại</th>
                          <th className="px-6 py-4 w-1/3">Nội dung Chat</th>
                        </>
                      )}
                      {activeTab === 'reports' && (
                        <>
                          <th className="px-6 py-4">Mã tra cứu</th>
                          <th className="px-6 py-4">Danh tính</th>
                          <th className="px-6 py-4">Loại</th>
                          <th className="px-6 py-4 w-1/4">Nội dung</th>
                          <th className="px-6 py-4 w-1/4">Phản hồi</th>
                          <th className="px-6 py-4 text-center">Trạng thái</th>
                        </>
                      )}
                      {activeTab === 'gratitude' && (
                        <>
                          <th className="px-6 py-4">Người gửi</th>
                          <th className="px-6 py-4">Người nhận</th>
                          <th className="px-6 py-4 w-1/2">Nội dung</th>
                        </>
                      )}
                      {activeTab === 'parent' && (
                        <>
                          <th className="px-6 py-4">Session ID</th>
                          <th className="px-6 py-4 w-1/2">Nội dung Chat</th>
                        </>
                      )}
                      <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data?.[activeTab === 'parent' ? 'parentCounseling' : activeTab]?.map((row: any, idx: number) => {
                      const rowIndex = row[row.length - 1];
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(row[0]).toLocaleString('vi-VN')}</td>
                          
                          {activeTab === 'counseling' && (
                            <>
                              <td className="px-6 py-4 font-mono text-xs">{row[1]}</td>
                              <td className="px-6 py-4 font-medium">{row[2]}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{row[3]}</span></td>
                              <td className="px-6 py-4 text-slate-600">
                                <div className="line-clamp-2">{row[4]}</div>
                              </td>
                            </>
                          )}
                          
                          {activeTab === 'reports' && (
                            <>
                              <td className="px-6 py-4 font-mono font-bold text-blue-600">{row[1]}</td>
                              <td className="px-6 py-4 font-medium">{row[2]}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded-md text-xs">{row[3]}</span></td>
                              <td className="px-6 py-4 text-slate-600">
                                <div className="line-clamp-2" title={row[4]}>{row[4]}</div>
                              </td>
                              <td className="px-6 py-4 text-slate-600">
                                <div className="line-clamp-2" title={row[5]}>{row[5]}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {row[5].includes('Cô đã tiếp nhận thông tin') ? (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">Chưa xử lý</span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">Đã xử lý</span>
                                )}
                              </td>
                            </>
                          )}

                          {activeTab === 'gratitude' && (
                            <>
                              <td className="px-6 py-4 font-medium">{row[1]}</td>
                              <td className="px-6 py-4 font-medium text-pink-600">{row[2]}</td>
                              <td className="px-6 py-4 text-slate-600">
                                <div className="line-clamp-2">{row[3]}</div>
                              </td>
                            </>
                          )}

                          {activeTab === 'parent' && (
                            <>
                              <td className="px-6 py-4 font-mono text-xs">{row[1]}</td>
                              <td className="px-6 py-4 text-slate-600">
                                <div className="line-clamp-2">{row[2]}</div>
                              </td>
                            </>
                          )}

                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            {(activeTab === 'counseling' || activeTab === 'parent' || activeTab === 'gratitude') && (
                              <Button variant="ghost" size="icon" onClick={() => setViewingChat({ type: activeTab, content: activeTab === 'counseling' ? row[4] : (activeTab === 'gratitude' ? row[3] : row[2]), sender: row[1], receiver: row[2] })} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {activeTab === 'reports' && (
                              <Button variant="ghost" size="icon" onClick={() => { setEditingReport({ rowIndex, currentReply: row[5] }); setReplyText(row[5]); }} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setDeletingItem({ sheetName: activeTab === 'parent' ? 'ParentCounseling' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1), rowIndex })} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {(!data?.[activeTab === 'parent' ? 'parentCounseling' : activeTab] || data[activeTab === 'parent' ? 'parentCounseling' : activeTab].length === 0) && (
                      <tr>
                        <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                          Chưa có dữ liệu nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Chat Viewer Modal */}
      {viewingChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">
                {viewingChat.type === 'gratitude' ? 'Chi tiết Thư Biết Ơn' : 'Chi tiết đoạn chat'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setViewingChat(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-slate-50">
              {(() => {
                const content = viewingChat.content;
                let userText = '';
                let aiPart = '';
                
                if (content.includes(' | AI: ')) {
                  const parts = content.split(' | AI: ');
                  userText = parts[0].replace(/^(User|Parent):\s*/, '');
                  aiPart = parts.slice(1).join(' | AI: ');
                } else {
                  userText = content;
                }
                
                const isParent = viewingChat.type === 'parent';
                const isGratitude = viewingChat.type === 'gratitude';
                
                return (
                  <>
                    {isGratitude ? (
                      <div className="p-6 bg-pink-50 text-pink-900 rounded-2xl border border-pink-100 shadow-sm relative overflow-hidden">
                        <Heart className="absolute -right-4 -bottom-4 w-24 h-24 text-pink-100 opacity-50" />
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4 pb-4 border-b border-pink-200/50">
                            <div>
                              <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">Người gửi</p>
                              <p className="font-medium">{viewingChat.sender || 'Ẩn danh'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-1">Người nhận</p>
                              <p className="font-medium text-pink-700">{viewingChat.receiver}</p>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-base leading-relaxed italic">
                            "{userText}"
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-end">
                          <div className="max-w-[85%] p-3 rounded-2xl bg-blue-600 text-white rounded-tr-sm shadow-sm">
                            <p className="text-xs font-bold mb-1 opacity-70">{isParent ? 'Phụ huynh' : 'Học sinh'}</p>
                            <div className="whitespace-pre-wrap text-sm">{userText}</div>
                          </div>
                        </div>
                        {aiPart && (
                          <div className="flex justify-start">
                            <div className="max-w-[85%] p-3 rounded-2xl bg-white border text-slate-800 rounded-tl-sm shadow-sm">
                              <p className="text-xs font-bold mb-1 opacity-70">AI Tư vấn</p>
                              <div className="whitespace-pre-wrap text-sm">{aiPart}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Reply Editor Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Phản hồi Thư Hỗ Trợ</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingReport(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <textarea
                className="w-full min-h-[200px] p-4 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi của Thầy/Cô dành cho học sinh..."
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setEditingReport(null)} disabled={isProcessing}>Hủy</Button>
                <Button onClick={submitReply} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">Lưu phản hồi</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-slate-500 mb-6">Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={isProcessing}>Hủy</Button>
              <Button onClick={confirmDelete} disabled={isProcessing} className="bg-red-600 hover:bg-red-700 text-white">Xóa dữ liệu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
