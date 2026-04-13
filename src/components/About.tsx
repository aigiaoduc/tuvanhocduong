import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';

export default function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full gap-8 py-12">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 w-full text-center space-y-6">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-heading font-medium text-gray-900">Giới thiệu Hệ thống</h2>
        <p className="text-gray-600 leading-relaxed text-lg">
          Hệ thống Tư vấn Học đường là một không gian an toàn, riêng tư dành cho học sinh và phụ huynh. Nơi đây cung cấp các công cụ hỗ trợ tâm lý, giải đáp thắc mắc và tiếp nhận các báo cáo ẩn danh để kịp thời hỗ trợ các em học sinh.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-2xl mt-8 text-left space-y-4 border border-gray-100">
          <h3 className="font-medium text-gray-900 text-lg border-b pb-2">Thông tin phát triển</h3>
          <p className="text-gray-700">
            <span className="font-medium">Tác giả:</span> Thầy Trần Hồng Quân
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Đơn vị:</span> Tổ Công nghệ thông tin - Trường TH&THCS xã Sa Bình, tỉnh Quảng Ngãi
          </p>
        </div>

        <div className="pt-8">
          <Button onClick={onBack} className="rounded-full px-8">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
