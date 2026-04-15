import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserIdentity, Message } from '../types';
import { generateAIResponse, moderateContent } from '../services/ai';
import { sendCounselingData } from '../services/sheet';
import { Send, Clock, Sparkles, Mic, MicOff, AlertTriangle, Phone, Mail, Home } from 'lucide-react';
import TypingMessage from './TypingMessage';

const QUICK_PROMPTS = [
  "Em đang cảm thấy rất áp lực với điểm số dạo này...",
  "Em vừa có chuyện không vui với bạn thân...",
  "Em cảm thấy mông lung, không biết mình thích học ngành gì...",
  "Em cảm thấy hơi lạc lõng và khó hòa nhập với các bạn trong lớp..."
];

export default function ChatTab({ identity, onSpamDetected, onGoHome, onGoToReport }: { identity: UserIdentity, onSpamDetected: () => void, onGoHome: () => void, onGoToReport: () => void }) {
  const [sessionId] = useState(() => `SS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: `Chào em, cô Minh thấy hôm nay em đang cảm thấy ${identity.mood?.toLowerCase() || 'bình thường'}. Cô ở đây để lắng nghe. Em muốn chia sẻ điều gì không?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCrisis, setIsCrisis] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'vi-VN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const CRISIS_KEYWORDS = [
    'tự tử', 'muốn chết', 'không muốn sống', 'rạch tay', 'kết liễu', 
    'nhảy lầu', 'uống thuốc ngủ', 'tuyệt vọng', 'giết mình', 'chết đi cho xong'
  ];

  const checkCrisis = (text: string) => {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.some(keyword => lowerText.includes(keyword));
  };

  const handleSend = async (textOverride?: string) => {
    const userText = (typeof textOverride === 'string' ? textOverride : input).trim();
    if (!userText || isLoading) return;

    setInput('');
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    // Lớp bảo vệ 1: Chặn từ khóa khủng hoảng (Crisis Interception)
    if (checkCrisis(userText)) {
      setIsLoading(false);
      setIsCrisis(true);
      return;
    }

    // Moderate content before sending to AI
    const isValid = await moderateContent(userText);
    if (!isValid) {
      onSpamDetected();
      setIsLoading(false);
      return;
    }

    const history = messages.map(m => `${m.role === 'user' ? 'Học sinh' : 'Giáo viên'}: ${m.text}`).join('\n');
    
    const systemPrompt = `Bạn là Cô giáo tư vấn tâm lý học đường tên là Minh (Cô Minh). Bạn luôn thân thiện, gần gũi, thấu hiểu và đưa ra lời khuyên hữu ích cho học sinh.
TUYỆT ĐỐI TUÂN THỦ: Nếu học sinh sử dụng từ ngữ tục tĩu, chửi thề, bạo lực, chém giết, tình dục, hoặc hỏi những câu trêu đùa cợt nhả không liên quan đến tâm lý học đường, bạn KHÔNG ĐƯỢC hùa theo hay trả lời nội dung đó. Bạn PHẢI từ chối lịch sự bằng câu: "Xin lỗi em, không gian này dành riêng cho việc chia sẻ những vấn đề tâm lý và học đường. Cô không thể trao đổi về chủ đề này. Em có tâm sự gì khác muốn chia sẻ không?"

Thông tin học sinh: Cảm xúc hiện tại là ${identity.mood || 'không rõ'}.

${history}
Học sinh: ${userText}
Cô Minh:`;

    const modelText = await generateAIResponse(systemPrompt);
    
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'model', text: modelText, isTyping: true },
    ]);

    await sendCounselingData(identity, sessionId, userText, modelText);
    setIsLoading(false);
  };

  const getUserBubbleColor = () => {
    switch (identity.mood) {
      case 'Vui vẻ': return 'bg-green-600 text-white';
      case 'Bình thường': return 'bg-blue-600 text-white';
      case 'Buồn bã': return 'bg-purple-600 text-white';
      case 'Lo âu': return 'bg-slate-600 text-white';
      case 'Tức giận': return 'bg-red-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-primary">Phòng Tư Vấn AI</h2>
        <p className="text-sm text-muted-foreground">Danh tính: <span className="font-medium text-foreground">{identity.id}</span> • Cảm xúc: <span className="font-medium text-foreground">{identity.mood}</span></p>
      </div>
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[500px]">
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? `${getUserBubbleColor()} rounded-tr-sm` : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {msg.role === 'model' ? (
                    <TypingMessage 
                      text={msg.text} 
                      isTyping={msg.isTyping} 
                      onComplete={() => {
                        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isTyping: false } : m));
                      }} 
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {messages.length === 1 && !isLoading && (
              <div className="flex flex-col items-start gap-3 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center text-sm font-medium text-muted-foreground mb-1">
                  <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
                  Gợi ý mở lời cho em:
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="rounded-2xl text-sm text-primary border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-left h-auto py-2.5 px-4 whitespace-normal transition-all"
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading || isCrisis}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-sm italic text-sm text-slate-500 flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  Cô Minh đang suy nghĩ...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-muted/20">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              className={`h-12 w-12 rounded-full shrink-0 ${isListening ? 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Dừng ghi âm" : "Nhập bằng giọng nói"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isCrisis}
              placeholder={isCrisis ? "Tính năng chat đã bị khóa để đảm bảo an toàn." : isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
              className="flex-1 h-12 rounded-full px-6 bg-white"
            />
            <Button type="submit" disabled={!input.trim() || isLoading || isCrisis} className="h-12 rounded-full px-6">
              <><Send className="w-5 h-5 mr-2" /> Gửi</>
            </Button>
          </form>
        </div>
      </div>

      {/* Crisis Modal */}
      {isCrisis && (
        <div className="fixed inset-0 z-[9999] bg-red-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 border-4 border-red-500">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-center text-red-600 mb-4 uppercase tracking-wider">
              Cảnh Báo An Toàn
            </h3>
            <p className="text-center text-slate-700 mb-6 text-base leading-relaxed">
              Cô Minh nhận thấy em đang trải qua một cảm xúc rất khó khăn và có những suy nghĩ gây hại cho bản thân. Trí tuệ nhân tạo không được phép tư vấn trong tình huống này.
              <br/><br/>
              Xin em hãy dừng lại, hít thở sâu và gọi ngay cho <strong>Tổng đài Quốc gia Bảo vệ Trẻ em 111</strong> (miễn phí 24/7) hoặc chia sẻ ngay với người lớn mà em tin tưởng. Cuộc sống của em rất quý giá, luôn có người sẵn sàng giúp đỡ em!
            </p>
            <a href="tel:111" className="flex items-center justify-center w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all hover:scale-105 mb-4">
              <Phone className="w-6 h-6 mr-2" />
              Gọi ngay 111
            </a>

            <div className="space-y-3">
              <button 
                onClick={onGoToReport}
                className="w-full flex flex-col items-center justify-center p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors text-amber-900"
              >
                <span className="font-semibold flex items-center"><Mail className="w-4 h-4 mr-2" /> Gửi thư cho thầy cô</span>
                <span className="text-xs text-amber-700 mt-1 text-center">Cô Minh khuyên em nên dùng tính năng này để các thầy cô có thể hỗ trợ em tốt nhất.</span>
              </button>
              
              <button 
                onClick={onGoHome}
                className="w-full flex flex-col items-center justify-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-700"
              >
                <span className="font-semibold flex items-center"><Home className="w-4 h-4 mr-2" /> Về trang chủ</span>
                <span className="text-xs text-slate-500 mt-1 text-center">Quay lại màn hình chính để sử dụng các tính năng khác.</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
