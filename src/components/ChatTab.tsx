import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserIdentity, Message } from '../types';
import { generateAIResponse, moderateContent } from '../services/ai';
import { sendCounselingData } from '../services/sheet';
import { Send, Clock, Sparkles, Mic, MicOff } from 'lucide-react';
import TypingMessage from './TypingMessage';

const QUICK_PROMPTS = [
  "Em đang cảm thấy rất áp lực với điểm số dạo này...",
  "Em vừa có chuyện không vui với bạn thân...",
  "Em cảm thấy mông lung, không biết mình thích học ngành gì...",
  "Em cảm thấy hơi lạc lõng và khó hòa nhập với các bạn trong lớp..."
];

export default function ChatTab({ identity, onSpamDetected }: { identity: UserIdentity, onSpamDetected: () => void }) {
  const [sessionId] = useState(() => `SS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: `Chào em, cô Minh thấy hôm nay em đang cảm thấy ${identity.mood?.toLowerCase() || 'bình thường'}. Cô ở đây để lắng nghe. Em muốn chia sẻ điều gì không?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      const crisisMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '⚠️ CẢNH BÁO AN TOÀN: Cô Minh nhận thấy em đang trải qua một cảm xúc rất khó khăn và có những suy nghĩ gây hại cho bản thân. Trí tuệ nhân tạo không được phép tư vấn trong tình huống này. \n\nXin em hãy dừng lại, hít thở sâu và gọi ngay cho **Tổng đài Quốc gia Bảo vệ Trẻ em 111** (miễn phí 24/7) hoặc chia sẻ ngay với người lớn mà em tin tưởng. Cuộc sống của em rất quý giá, luôn có người sẵn sàng giúp đỡ em!',
        isTyping: true
      };
      setMessages(prev => [...prev, crisisMsg]);
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
                      disabled={isLoading}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-slate-100 text-slate-800 rounded-tl-sm italic text-sm text-slate-500">
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
              disabled={isLoading}
              placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
              className="flex-1 h-12 rounded-full px-6 bg-white"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} className="h-12 rounded-full px-6">
              <><Send className="w-5 h-5 mr-2" /> Gửi</>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
