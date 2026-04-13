import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ 
  onGoBack, 
  showBack,
  onSelectFeature,
  onShowAbout
}: { 
  onGoBack: () => void, 
  showBack: boolean,
  onSelectFeature: (feature: 'chat' | 'report' | 'track' | 'gratitude' | 'parent' | 'library') => void,
  onShowAbout: () => void
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-heading font-bold text-xl text-gray-900 flex items-center gap-2 cursor-pointer" onClick={onGoBack}>
          Góc Nhỏ Lắng Nghe
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          <button onClick={() => handleNav(onGoBack)} className="hover:text-gray-900 transition-colors">Trang chủ</button>
          <button onClick={() => handleNav(() => onSelectFeature('chat'))} className="hover:text-gray-900 transition-colors">Tư vấn AI</button>
          <button onClick={() => handleNav(() => onSelectFeature('report'))} className="hover:text-gray-900 transition-colors">Gửi thư</button>
          <button onClick={() => handleNav(() => onSelectFeature('track'))} className="hover:text-gray-900 transition-colors">Tra cứu</button>
          <button onClick={() => handleNav(() => onSelectFeature('library'))} className="hover:text-gray-900 transition-colors">Cẩm nang</button>
          <button onClick={() => handleNav(() => onSelectFeature('gratitude'))} className="hover:text-gray-900 transition-colors">Biết ơn</button>
          <button onClick={() => handleNav(() => onSelectFeature('parent'))} className="hover:text-gray-900 transition-colors">Phụ huynh</button>
          <button onClick={() => handleNav(onShowAbout)} className="hover:text-gray-900 transition-colors">Giới thiệu</button>
        </nav>

        <div className="flex items-center gap-2">
          {showBack && (
            <Button variant="ghost" onClick={onGoBack} className="hidden md:flex text-gray-600 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Trở lại
            </Button>
          )}
          {/* Mobile Menu Toggle */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 px-4 flex flex-col gap-4 text-sm font-medium text-gray-700 z-50">
          <button onClick={() => handleNav(onGoBack)} className="text-left py-2 border-b border-gray-50">Trang chủ</button>
          <button onClick={() => handleNav(() => onSelectFeature('chat'))} className="text-left py-2 border-b border-gray-50">Phòng Tư vấn AI</button>
          <button onClick={() => handleNav(() => onSelectFeature('report'))} className="text-left py-2 border-b border-gray-50">Gửi Thư Hỗ Trợ</button>
          <button onClick={() => handleNav(() => onSelectFeature('track'))} className="text-left py-2 border-b border-gray-50">Tra Cứu Báo Cáo</button>
          <button onClick={() => handleNav(() => onSelectFeature('library'))} className="text-left py-2 border-b border-gray-50">Cẩm Nang Tâm Lý</button>
          <button onClick={() => handleNav(() => onSelectFeature('gratitude'))} className="text-left py-2 border-b border-gray-50">Hộp Thư Biết Ơn</button>
          <button onClick={() => handleNav(() => onSelectFeature('parent'))} className="text-left py-2 border-b border-gray-50">Góc Phụ Huynh</button>
          <button onClick={() => handleNav(onShowAbout)} className="text-left py-2">Giới thiệu</button>
        </div>
      )}
    </header>
  );
}
