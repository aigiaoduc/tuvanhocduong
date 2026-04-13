import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserIdentity } from '../types';
import { sendReportData } from '../services/sheet';
import { Send, Info, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { moderateContent } from '../services/ai';

export default function ReportTab({ identity }: { identity: UserIdentity }) {
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketCode, setTicketCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    
    // AI Content Moderation
    const isValid = await moderateContent(reportText);
    if (!isValid) {
      setErrorMsg('Hệ thống phát hiện nội dung của em sử dụng từ ngữ không phù hợp hoặc mang tính chất trêu đùa. Xin lưu ý đây là kênh hỗ trợ nghiêm túc của nhà trường. Vui lòng chỉnh sửa lại nội dung.');
      setIsSubmitting(false);
      return;
    }

    const newTicketCode = `HS-${Math.floor(1000 + Math.random() * 9000)}`;
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await sendReportData(identity, newTicketCode, reportText);

    setTicketCode(newTicketCode);
    setReportText('');
    setIsSubmitting(false);
  };

  const handleCopy = () => {
    if (ticketCode) {
      navigator.clipboard.writeText(ticketCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 gap-6 relative">
      {/* Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Đang gửi dữ liệu lên hệ thống</h3>
            <p className="text-sm text-slate-500 text-center">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      )}

      <div className="mb-2">
        <h2 className="text-2xl font-bold text-primary mb-2">Gửi Thư Hỗ Trợ</h2>
        <p className="text-sm text-muted-foreground">Danh tính: {identity.id} • Cảm xúc: {identity.mood}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        <div className="bg-secondary/30 p-4 rounded-xl flex gap-3 items-start mb-6">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            Mọi thông tin em gửi ở đây sẽ được bảo mật. Sau khi gửi, em sẽ nhận được một <strong>Mã theo dõi</strong> để kiểm tra tiến độ xử lý.
          </p>
        </div>

        {ticketCode ? (
          <div className="p-6 bg-green-50 border border-green-200 rounded-2xl text-center space-y-4">
            <h3 className="text-xl font-bold text-green-800">Gửi báo cáo thành công!</h3>
            <p className="text-green-700">Mã theo dõi của em là:</p>
            <div className="flex items-center justify-center gap-2">
              <div className="text-3xl font-mono font-bold text-primary bg-white py-3 px-6 rounded-xl inline-block shadow-sm">
                {ticketCode}
              </div>
              <Button variant="outline" size="icon" onClick={handleCopy} className="h-14 w-14 rounded-xl" title="Sao chép mã">
                {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6 text-muted-foreground" />}
              </Button>
            </div>
            <p className="text-sm text-green-600">Hãy lưu lại mã này và dùng tính năng <strong>Tra Cứu Báo Cáo</strong> ở Trang chủ để xem trạng thái xử lý nhé.</p>
            <Button onClick={() => setTicketCode(null)} variant="outline" className="mt-4">Gửi báo cáo mới</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
            <Textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              disabled={isSubmitting}
              required
              placeholder="Em hãy kể lại sự việc ở đây nhé..."
              className="min-h-[250px] resize-none rounded-xl p-4 text-base"
            />
            <Button type="submit" disabled={isSubmitting || !reportText.trim()} className="w-full h-14 rounded-full text-lg">
              {isSubmitting ? 'Đang gửi...' : <><Send className="w-5 h-5 mr-2" /> Gửi thư hỗ trợ</>}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
