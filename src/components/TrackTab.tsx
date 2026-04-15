import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkTicketStatus, sendReportData } from '../services/sheet';
import { fetchAllData } from '../services/admin';
import { Search, MessageSquare, Send } from 'lucide-react';

export default function TrackTab() {
  const [searchCode, setSearchCode] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Fetch all data to reconstruct conversation
      const allData = await fetchAllData();
      if (allData && allData.reports) {
        const reports = allData.reports.filter((r: any) => r[1] === searchCode.trim());
        if (reports.length > 0) {
          // Sort by timestamp
          reports.sort((a: any, b: any) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
          setConversation(reports);
          setSearchStatus('found');
        } else {
          // Fallback to basic check if fetchAllData fails or no reports found
          const status = await checkTicketStatus(searchCode.trim());
          setSearchStatus(status || 'Không tìm thấy mã báo cáo này.');
          setConversation([]);
        }
      } else {
        const status = await checkTicketStatus(searchCode.trim());
        setSearchStatus(status || 'Không tìm thấy mã báo cáo này.');
        setConversation([]);
      }
    } catch (err) {
      const status = await checkTicketStatus(searchCode.trim());
      setSearchStatus(status || 'Không tìm thấy mã báo cáo này.');
      setConversation([]);
    }
    
    setIsSearching(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || conversation.length === 0) return;
    
    setIsReplying(true);
    const firstRow = conversation[0];
    const identity = { 
      id: firstRow[2], 
      type: firstRow[3] === '[ẨN DANH]' ? 'anonymous' : 'identified' 
    };
    
    await sendReportData(identity as any, searchCode.trim(), replyText.trim());
    setReplyText('');
    
    // Wait a bit for Google Sheets to process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Refresh conversation
    await handleSearch(new Event('submit') as any);
    setIsReplying(false);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 gap-6">
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-primary mb-2">Tra Cứu Báo Cáo</h2>
        <p className="text-sm text-muted-foreground">Nhập mã theo dõi để xem phản hồi từ Thầy/Cô.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input 
            placeholder="Nhập mã báo cáo (VD: HS-1234)..." 
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="h-12 rounded-xl"
          />
          <Button type="submit" disabled={isSearching || !searchCode.trim()} className="h-12 px-6 rounded-xl">
            {isSearching ? 'Đang tìm...' : <><Search className="w-4 h-4 mr-2" /> Tra cứu</>}
          </Button>
        </form>
        {searchStatus && searchStatus !== 'found' && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-bottom-4 text-left">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800">Phản hồi từ Thầy/Cô:</h3>
            </div>
            <div className="p-4 bg-white border border-blue-100 rounded-xl text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
              {searchStatus}
            </div>
          </div>
        )}

        {searchStatus === 'found' && conversation.length > 0 && (
          <div className="mt-8 flex flex-col h-[500px] border rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-50 p-4 border-b flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-800">Chi tiết cuộc hội thoại</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {conversation.map((msg: any, idx: number) => (
                <React.Fragment key={idx}>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] p-3 rounded-2xl bg-blue-600 text-white rounded-tr-sm shadow-sm">
                      <p className="text-xs font-bold mb-1 opacity-70">Bạn</p>
                      <div className="whitespace-pre-wrap text-sm">{msg[4]}</div>
                    </div>
                  </div>
                  {msg[5] && !msg[5].includes('Cô đã tiếp nhận thông tin') && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] p-3 rounded-2xl bg-white border text-slate-800 rounded-tl-sm shadow-sm">
                        <p className="text-xs font-bold mb-1 opacity-70">Thầy/Cô</p>
                        <div className="whitespace-pre-wrap text-sm">{msg[5]}</div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="p-4 bg-white border-t">
              <form onSubmit={handleReply} className="flex gap-2">
                <Input 
                  placeholder="Nhập phản hồi của bạn..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isReplying}
                  className="flex-1 h-12 rounded-xl"
                />
                <Button type="submit" disabled={isReplying || !replyText.trim()} className="h-12 px-6 rounded-xl">
                  {isReplying ? 'Đang gửi...' : <><Send className="w-4 h-4 mr-2" /> Gửi</>}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
