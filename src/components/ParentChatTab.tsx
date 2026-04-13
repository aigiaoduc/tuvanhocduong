import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Message } from '../types';
import { generateAIResponse, moderateContent } from '../services/ai';
import { sendParentCounselingData } from '../services/sheet';
import { Send, Clock, Sparkles, Users, Mic, MicOff } from 'lucide-react';
import TypingMessage from './TypingMessage';

const QUICK_PROMPTS = [
  "Con tôi dạo này hay cáu gắt và đóng cửa phòng, tôi nên làm gì?",
  "Làm sao để khuyên con bớt chơi game mà không xảy ra cãi vã?",
  "Tôi muốn hiểu thêm về tâm lý tuổi dậy thì của các cháu...",
  "Con tôi đang gặp áp lực điểm số nhưng cháu không chịu chia sẻ..."
];

export default function ParentChatTab({ onSpamDetected }: { onSpamDetected: () => void }) {
  const [sessionId] = useState(() => `PR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: `Chào anh/chị. Đây là Góc Phụ Huynh - nơi chia sẻ và đồng hành cùng anh/chị trong việc thấu hiểu tâm lý con trẻ. Anh/chị đang có những băn khoăn gì cần tư vấn ạ?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSend = async (textOverride?: string) => {
    const userText = (typeof textOverride === 'string' ? textOverride : input).trim();
    if (!userText || isLoading || cooldown > 0) return;

    setInput('');
    
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userText };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    // Moderate content before sending to AI
    const isValid = await moderateContent(userText);
    if (!isValid) {
      onSpamDetected();
      setIsLoading(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const history = messages.map(m => `${m.role === 'user' ? 'Phụ huynh' : 'Chuyên gia'}: ${m.text}`).join('\n');
    
    const systemPrompt = `Bạn là Chuyên gia tâm lý học đường tư vấn cho Phụ huynh học sinh. Bạn luôn điềm đạm, thấu hiểu, tôn trọng và đưa ra những lời khuyên thiết thực, có cơ sở khoa học tâm lý để giúp phụ huynh kết nối với con cái.
TUYỆT ĐỐI TUÂN THỦ: Nếu người dùng gõ nội dung tục tĩu, chửi thề, bạo lực, chém giết, tình dục, hoặc trêu đùa cợt nhả không liên quan đến tâm lý giáo dục, bạn KHÔNG ĐƯỢC hùa theo hay trả lời nội dung đó. Bạn PHẢI từ chối lịch sự bằng câu: "Xin lỗi, không gian này dành riêng cho việc tư vấn tâm lý giáo dục và đồng hành cùng phụ huynh. Tôi không thể trao đổi về chủ đề này. Anh/chị có băn khoăn nào khác về việc nuôi dạy con cần chia sẻ không?"

${history}
Phụ huynh: ${userText}
Chuyên gia:`;

    const modelText = await generateAIResponse(systemPrompt);
    
    setMessages((prev) => [
      ...prev,
      { id: (Date.now() + 1).toString(), role: 'model', text: modelText, isTyping: true },
    ]);

    await sendParentCounselingData(sessionId, userText, modelText);
    setIsLoading(false);
    setCooldown(30);
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-primary">Góc Phụ Huynh</h2>
          <p className="text-sm text-muted-foreground">Đồng hành cùng cha mẹ thấu hiểu tâm lý tuổi teen</p>
        </div>
      </div>
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border overflow-hidden min-h-[500px]">
        <ScrollArea className="flex-1 p-4 sm:p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-muted/50 text-foreground rounded-tl-sm'}`}>
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
                  Gợi ý chủ đề tư vấn:
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="rounded-2xl text-sm text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-left h-auto py-2.5 px-4 whitespace-normal transition-all"
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading || cooldown > 0}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="p-4 rounded-2xl bg-muted/50 text-foreground rounded-tl-sm italic text-sm text-muted-foreground">
                  Chuyên gia đang suy nghĩ...
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
              disabled={isLoading || cooldown > 0}
              placeholder={cooldown > 0 ? `Vui lòng đợi ${cooldown}s để gửi tiếp...` : isListening ? "Đang nghe..." : "Nhập câu hỏi của anh/chị..."}
              className="flex-1 h-12 rounded-full px-6 bg-white"
            />
            <Button type="submit" disabled={!input.trim() || isLoading || cooldown > 0} className="h-12 rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white">
              {cooldown > 0 ? (
                <><Clock className="w-5 h-5 mr-2" /> {cooldown}s</>
              ) : (
                <><Send className="w-5 h-5 mr-2" /> Gửi</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
