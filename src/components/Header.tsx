import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, X, Download, Share } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [os, setOs] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    setIsInstalled(!!isStandalone);

    // Detect OS
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setOs('ios');
    } else if (/android/.test(userAgent)) {
      setOs('android');
    } else {
      setOs('desktop');
    }
  }, []);

  const handleNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
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
            {!isInstalled && !showBack && (
              <Button variant="outline" onClick={() => setShowInstallGuide(true)} className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full text-sm font-medium h-9 px-4 hidden sm:flex">
                <Download className="w-4 h-4 mr-2" />
                Tải app
              </Button>
            )}
            {!isInstalled && !showBack && (
              <Button variant="outline" size="icon" onClick={() => setShowInstallGuide(true)} className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-full h-9 w-9 sm:hidden" title="Tải app">
                <Download className="w-4 h-4" />
              </Button>
            )}
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

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowInstallGuide(false)} className="absolute top-4 right-4 p-2 bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Download className="w-8 h-8 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-center text-slate-800 mb-2">
              Cài đặt ứng dụng
            </h3>
            <p className="text-center text-slate-500 mb-6 text-sm">
              Thêm Góc Nhỏ Lắng Nghe vào màn hình chính để truy cập nhanh chóng và dễ dàng hơn.
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              {os === 'ios' && (
                <div className="space-y-4 text-slate-700 text-sm">
                  <p className="font-medium text-slate-900">Hướng dẫn cho iPhone/iPad:</p>
                  <ol className="list-decimal pl-5 space-y-3 marker:text-blue-600 marker:font-bold">
                    <li>Nhấn vào biểu tượng <strong>Chia sẻ</strong> <Share className="w-4 h-4 inline-block mx-1 text-blue-600" /> ở thanh công cụ dưới cùng của Safari.</li>
                    <li>Cuộn xuống và chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen).</li>
                    <li>Nhấn <strong>Thêm</strong> ở góc trên bên phải.</li>
                  </ol>
                </div>
              )}

              {os === 'android' && (
                <div className="space-y-4 text-slate-700 text-sm">
                  <p className="font-medium text-slate-900">Hướng dẫn cho Android:</p>
                  <ol className="list-decimal pl-5 space-y-3 marker:text-blue-600 marker:font-bold">
                    <li>Nhấn vào biểu tượng <strong>Menu</strong> (3 dấu chấm) ở góc trên bên phải trình duyệt.</li>
                    <li>Chọn <strong>Thêm vào Màn hình chính</strong> (Add to Home screen) hoặc <strong>Cài đặt ứng dụng</strong> (Install app).</li>
                    <li>Làm theo hướng dẫn trên màn hình để hoàn tất.</li>
                  </ol>
                </div>
              )}

              {os === 'desktop' && (
                <div className="space-y-4 text-slate-700 text-sm">
                  <p className="font-medium text-slate-900">Hướng dẫn cho Máy tính:</p>
                  <p>Nhấn vào biểu tượng <strong>Cài đặt</strong> (Install) ở góc phải của thanh địa chỉ trình duyệt, sau đó chọn Cài đặt.</p>
                </div>
              )}
            </div>

            <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-medium text-base shadow-lg shadow-blue-200" onClick={() => setShowInstallGuide(false)}>
              Đã hiểu
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
