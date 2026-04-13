import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkTicketStatus } from '../services/sheet';
import { Search, MessageSquare } from 'lucide-react';

export default function TrackTab() {
  const [searchCode, setSearchCode] = useState('');
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    setIsSearching(true);
    const status = await checkTicketStatus(searchCode.trim());
    setSearchStatus(status || 'Không tìm thấy mã báo cáo này.');
    setIsSearching(false);
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
        {searchStatus && (
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
      </div>
    </div>
  );
}
