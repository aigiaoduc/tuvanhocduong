import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { sendGratitudeData } from '../services/sheet';
import { Send, Heart, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { moderateContent } from '../services/ai';

export default function GratitudeTab() {
  const [receiver, setReceiver] = useState('');
  const [message, setMessage] = useState('');
  const [sender, setSender] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiver.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    
    // AI Content Moderation
    const textToModerate = `Gửi đến: ${receiver}. Lời nhắn: ${message}`;
    const isValid = await moderateContent(textToModerate);
    if (!isValid) {
      setErrorMsg('Hệ thống phát hiện nội dung của em sử dụng từ ngữ không phù hợp hoặc mang tính chất trêu đùa. Xin lưu ý đây là kênh hỗ trợ nghiêm túc của nhà trường. Vui lòng chỉnh sửa lại nội dung.');
      setIsSubmitting(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
    await sendGratitudeData(sender.trim(), receiver.trim(), message.trim());

    setIsSuccess(true);
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setReceiver('');
    setMessage('');
    setSender('');
    setIsSuccess(false);
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 gap-6 relative">
      {/* Processing Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200">
            <RefreshCw className="w-10 h-10 text-pink-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">Đang gửi dữ liệu lên hệ thống</h3>
            <p className="text-sm text-slate-500 text-center">Vui lòng chờ trong giây lát...</p>
          </div>
        </div>
      )}

      <div className="mb-2 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-500 mb-4">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Hộp Thư Biết Ơn</h2>
        <p className="text-sm text-muted-foreground">Lan tỏa năng lượng tích cực bằng cách gửi lời cảm ơn đến những người đã giúp đỡ em.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
        {isSuccess ? (
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-green-700">Gửi lời cảm ơn thành công!</h3>
            <p className="text-muted-foreground">Tấm thiệp của em đã được lưu lại. Cảm ơn em vì đã lan tỏa sự tử tế hôm nay.</p>
            <Button onClick={handleReset} variant="outline" className="mt-4">Gửi thêm lời cảm ơn</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Gửi đến ai? (Bắt buộc)</label>
              <Input
                placeholder="VD: Cô Lan dạy Toán, Bạn Minh lớp 10A1..."
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                disabled={isSubmitting}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Lời nhắn của em (Bắt buộc)</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Em muốn cảm ơn vì điều gì..."
                className="min-h-[150px] resize-none rounded-xl p-4 text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Người gửi (Không bắt buộc)</label>
              <Input
                placeholder="Tên của em (hoặc để trống nếu muốn ẩn danh)"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                disabled={isSubmitting}
                className="h-12 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !receiver.trim() || !message.trim()} className="w-full h-14 rounded-full text-lg bg-pink-500 hover:bg-pink-600 text-white">
              {isSubmitting ? 'Đang gửi...' : <><Send className="w-5 h-5 mr-2" /> Gửi đi yêu thương</>}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
