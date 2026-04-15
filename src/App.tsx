import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Welcome from './components/Welcome';
import ChatTab from './components/ChatTab';
import ReportTab from './components/ReportTab';
import TrackTab from './components/TrackTab';
import GratitudeTab from './components/GratitudeTab';
import ParentChatTab from './components/ParentChatTab';
import Header from './components/Header';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import About from './components/About';
import LibraryTab from './components/LibraryTab';
import { UserIdentity } from './types';
import { KeyRound, AlertTriangle } from 'lucide-react';

export type AppView = 'home' | 'identity-chat' | 'identity-report' | 'chat' | 'report' | 'track' | 'gratitude' | 'parent' | 'library' | 'admin-login' | 'admin-dashboard' | 'about';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [identity, setIdentity] = useState<UserIdentity | null>(null);

  // Global penalty state
  const [penaltyEndTime, setPenaltyEndTime] = useState<number | null>(() => {
    const stored = localStorage.getItem('spamPenaltyUntil');
    if (stored) {
      const time = parseInt(stored, 10);
      if (time > Date.now()) return time;
    }
    return null;
  });
  const [penaltyRemaining, setPenaltyRemaining] = useState<number>(0);

  useEffect(() => {
    if (!penaltyEndTime) return;
    
    const interval = setInterval(() => {
      const remaining = Math.ceil((penaltyEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        setPenaltyEndTime(null);
        setPenaltyRemaining(0);
        localStorage.removeItem('spamPenaltyUntil');
        clearInterval(interval);
      } else {
        setPenaltyRemaining(remaining);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [penaltyEndTime]);

  const handleSpamDetected = () => {
    const endTime = Date.now() + 180 * 1000; // 180 seconds
    localStorage.setItem('spamPenaltyUntil', endTime.toString());
    setPenaltyEndTime(endTime);
    setPenaltyRemaining(180);
  };

  const handleGoBack = () => {
    setView('home');
    setIdentity(null);
  };

  const handleSelectFeature = (feature: 'chat' | 'report' | 'track' | 'gratitude' | 'parent' | 'library') => {
    if (feature === 'track') {
      setView('track');
    } else if (feature === 'gratitude') {
      setView('gratitude');
    } else if (feature === 'parent') {
      setView('parent');
    } else if (feature === 'library') {
      setView('library');
    } else {
      setView(feature === 'chat' ? 'identity-chat' : 'identity-report');
    }
  };

  const handleIdentitySelect = (id: UserIdentity) => {
    setIdentity(id);
    setView(view === 'identity-chat' ? 'chat' : 'report');
  };

  if (view === 'admin-login') {
    return <AdminLogin onLogin={() => setView('admin-dashboard')} onBack={handleGoBack} />;
  }

  if (view === 'admin-dashboard') {
    return <AdminDashboard onLogout={handleGoBack} />;
  }

  const getMoodBgClass = () => {
    if (view !== 'chat' || !identity?.mood) return 'bg-background';
    switch (identity.mood) {
      case 'Vui vẻ': return 'bg-yellow-50';
      case 'Bình thường': return 'bg-slate-50';
      case 'Buồn bã': return 'bg-blue-50';
      case 'Tức giận': return 'bg-red-50';
      case 'Lo âu': return 'bg-purple-50';
      case 'Áp lực': return 'bg-orange-50';
      default: return 'bg-background';
    }
  };

  return (
    <div className={`min-h-screen ${getMoodBgClass()} flex flex-col relative font-sans transition-colors duration-500`}>
      {penaltyRemaining > 0 && (
        <div className="fixed inset-0 z-[100] bg-red-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-red-500 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4 uppercase tracking-wider">Cảnh Báo Vi Phạm!</h2>
            <p className="text-slate-700 mb-6 text-lg">
              Hệ thống phát hiện bạn đã gửi nội dung không phù hợp, spam hoặc vi phạm tiêu chuẩn cộng đồng.
            </p>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6">
              <p className="text-red-800 font-medium mb-2">
                Tài khoản của bạn đang bị tạm khóa.
              </p>
              <p className="text-red-600 text-sm">
                Nếu tiếp tục vi phạm sau khi mở khóa, hệ thống sẽ cấm vĩnh viễn thiết bị của bạn truy cập vào ứng dụng.
              </p>
            </div>
            <div className="text-4xl font-mono font-bold text-red-600 mb-2">
              {Math.floor(penaltyRemaining / 60)}:{(penaltyRemaining % 60).toString().padStart(2, '0')}
            </div>
            <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">Thời gian chờ</p>
          </div>
        </div>
      )}

      <Header 
        onGoBack={handleGoBack} 
        showBack={view !== 'home'} 
        onSelectFeature={handleSelectFeature}
        onShowAbout={() => setView('about')}
      />
      <main className="flex-1 flex flex-col relative">
        {view === 'home' && <Home onSelectFeature={handleSelectFeature} />}
        {(view === 'identity-chat' || view === 'identity-report') && (
          <Welcome onSelectIdentity={handleIdentitySelect} feature={view === 'identity-chat' ? 'chat' : 'report'} onBack={handleGoBack} />
        )}
        {view === 'chat' && identity && <ChatTab identity={identity} onSpamDetected={handleSpamDetected} onGoHome={handleGoBack} onGoToReport={() => setView('report')} />}
        {view === 'report' && identity && <ReportTab identity={identity} />}
        {view === 'track' && <TrackTab />}
        {view === 'gratitude' && <GratitudeTab />}
        {view === 'library' && <LibraryTab />}
        {view === 'parent' && <ParentChatTab onSpamDetected={handleSpamDetected} />}
        {view === 'about' && <About onBack={handleGoBack} />}
      </main>
      
      {view === 'home' && (
        <button 
          onClick={() => setView('admin-login')}
          className="fixed bottom-4 right-4 p-3 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors shadow-sm"
          title="Quản trị viên"
        >
          <KeyRound className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
