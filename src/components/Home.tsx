import { useEffect, useState } from 'react';
import { MessageCircleHeart, Mail, Quote, Search, Heart, Users, ArrowRight, BookOpen } from 'lucide-react';
import { getDailyQuote } from '../services/sheet';
import ImpactBoard from './ImpactBoard';

export default function Home({ onSelectFeature }: { onSelectFeature: (feature: 'chat' | 'report' | 'track' | 'gratitude' | 'parent' | 'library') => void }) {
  const [quote, setQuote] = useState("Đang tải lời chúc...");

  useEffect(() => {
    getDailyQuote().then(setQuote);
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full pb-12">
      {/* Header & Hero Section - Compact */}
      <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-5 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-[#111827] leading-tight tracking-tight">
            Hệ Thống Tư Vấn <br />
            <span className="italic">Học Đường</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-800 font-sans mt-3 font-medium">
            Trường TH&THCS xã Sa Bình, tỉnh Quảng Ngãi
          </p>
          <p className="text-gray-500 font-sans font-light max-w-md mx-auto md:mx-0 text-lg">
            Không gian an toàn, luôn sẵn sàng lắng nghe và đồng hành cùng bạn.
          </p>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-full border border-gray-200 shadow-sm max-w-full">
            <Quote className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm italic text-gray-600 truncate text-left">{quote}</span>
          </div>
        </div>
        <div className="w-full md:w-1/2 lg:w-5/12">
          <div className="relative w-full h-48 md:h-56 lg:h-64 rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <img 
              src="https://res.cloudinary.com/dejnvixvn/image/upload/v1775902170/Gemini_Generated_Image_4lk09c4lk09c4lk0_hpyxcv.png" 
              alt="Hero" 
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Features Bento Grid */}
      <div className="w-full max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Chat AI */}
          <div 
            onClick={() => onSelectFeature('chat')}
            className="group col-span-1 bg-[#111827] text-white p-6 sm:p-8 rounded-3xl cursor-pointer hover:scale-[1.02] transition-all shadow-md hover:shadow-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="w-6 h-6 text-white/50" />
            </div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <MessageCircleHeart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2">Phòng Tư Vấn AI</h3>
              <p className="text-sm text-gray-300 font-light leading-relaxed">Trò chuyện an toàn, riêng tư về áp lực học tập, bạn bè hay cảm xúc của em.</p>
            </div>
          </div>

          {/* Report */}
          <div 
            onClick={() => onSelectFeature('report')}
            className="group col-span-1 bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all flex flex-col justify-between min-h-[220px]"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
              <Mail className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2 text-gray-900">Gửi Thư Hỗ Trợ</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">Báo cáo ẩn danh các vấn đề nghiêm trọng để nhà trường kịp thời can thiệp.</p>
            </div>
          </div>

          {/* Track */}
          <div 
            onClick={() => onSelectFeature('track')}
            className="group col-span-1 bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl cursor-pointer hover:border-gray-300 hover:shadow-lg transition-all flex flex-col justify-between min-h-[220px]"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-gray-100 transition-colors">
              <Search className="w-7 h-7 text-gray-700" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2 text-gray-900">Tra Cứu Báo Cáo</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">Nhập mã theo dõi để xem trạng thái xử lý thư hỗ trợ mà em đã gửi.</p>
            </div>
          </div>

          {/* Gratitude */}
          <div 
            onClick={() => onSelectFeature('gratitude')}
            className="group col-span-1 bg-pink-50 border border-pink-100 p-6 sm:p-8 rounded-3xl cursor-pointer hover:shadow-lg hover:border-pink-200 transition-all flex flex-col justify-between min-h-[220px]"
          >
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-200 transition-colors">
              <Heart className="w-7 h-7 text-pink-600" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2 text-pink-900">Hộp Thư Biết Ơn</h3>
              <p className="text-sm text-pink-700/80 font-light leading-relaxed">Gửi lời cảm ơn ẩn danh hoặc có tên để lan tỏa năng lượng tích cực.</p>
            </div>
          </div>

          {/* Library */}
          <div 
            onClick={() => onSelectFeature('library')}
            className="group col-span-1 bg-emerald-50 border border-emerald-100 p-6 sm:p-8 rounded-3xl cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between min-h-[220px]"
          >
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors">
              <BookOpen className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2 text-emerald-900">Cẩm Nang Tâm Lý</h3>
              <p className="text-sm text-emerald-700/80 font-light leading-relaxed">Đọc các bài viết, mẹo vặt giúp cân bằng cảm xúc và quản lý thời gian.</p>
            </div>
          </div>

          {/* Parent */}
          <div 
            onClick={() => onSelectFeature('parent')}
            className="group col-span-1 md:col-span-1 bg-blue-50 border border-blue-100 p-6 sm:p-8 rounded-3xl cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="w-6 h-6 text-blue-400" />
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
              <Users className="w-7 h-7 text-blue-700" />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-medium mb-2 text-blue-900">Góc Phụ Huynh</h3>
              <p className="text-sm text-blue-800/80 font-light leading-relaxed">Không gian dành riêng cho cha mẹ để tìm kiếm lời khuyên, thấu hiểu tâm lý tuổi dậy thì.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Impact Board Section */}
      <div className="w-full max-w-6xl mx-auto px-4 py-12 border-t border-gray-100 mt-8">
        <ImpactBoard />
      </div>
    </div>
  );
}
