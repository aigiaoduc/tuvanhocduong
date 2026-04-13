import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserIdentity } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Ghost, Smile, Frown, Meh, Angry, CloudRain, ArrowLeft } from 'lucide-react';

const MOODS = [
  { id: 'vui', label: 'Vui vẻ', icon: Smile, color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'binh-thuong', label: 'Bình thường', icon: Meh, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'buon', label: 'Buồn bã', icon: Frown, color: 'text-purple-500', bg: 'bg-purple-100' },
  { id: 'lo-au', label: 'Lo âu', icon: CloudRain, color: 'text-gray-500', bg: 'bg-gray-100' },
  { id: 'tuc-gian', label: 'Tức giận', icon: Angry, color: 'text-red-500', bg: 'bg-red-100' },
];

export default function Welcome({ onSelectIdentity, feature, onBack }: { onSelectIdentity: (identity: UserIdentity) => void, feature: 'chat' | 'report', onBack: () => void }) {
  const [step, setStep] = useState<'identity' | 'name' | 'mood'>('identity');
  const [tempIdentity, setTempIdentity] = useState<Partial<UserIdentity>>({});
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');

  const featureName = feature === 'chat' ? 'Phòng Tư Vấn AI' : 'Gửi Thư Hỗ Trợ';

  const handleAnonymous = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setTempIdentity({
      type: 'anonymous',
      id: `Học sinh ẩn danh #${randomId}`,
    });
    setStep('mood');
  };

  const handleIdentified = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setTempIdentity({
        type: 'identified',
        id: `${name} - ${className}`,
        name: name.trim(),
        class: className.trim(),
      });
      setStep('mood');
    }
  };

  const handleSelectMood = (moodLabel: string) => {
    onSelectIdentity({
      ...tempIdentity,
      mood: moodLabel
    } as UserIdentity);
  };

  const handleBackStep = () => {
    if (step === 'mood') {
      setStep(tempIdentity.type === 'anonymous' ? 'identity' : 'name');
    } else if (step === 'name') {
      setStep('identity');
    } else {
      onBack();
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-sm relative">
        <Button variant="ghost" size="icon" onClick={handleBackStep} className="absolute left-4 top-4 text-muted-foreground hover:text-primary z-10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <CardHeader className="text-center pb-6 pt-10">
          <CardTitle className="text-2xl text-primary mb-2">
            {step === 'mood' ? 'Nhật Ký Cảm Xúc' : 'Chọn Danh Tính'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 'mood' 
              ? 'Hôm nay màu sắc cảm xúc của em là gì?' 
              : `Trước khi vào ${featureName}, em muốn xưng hô thế nào?`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'identity' && (
            <div className="space-y-4">
              <Button onClick={handleAnonymous} className="w-full h-14 text-lg rounded-full shadow-sm">
                <Ghost className="mr-2 w-5 h-5" />
                Tiếp tục ẩn danh
              </Button>
              <Button onClick={() => setStep('name')} variant="outline" className="w-full h-14 text-lg rounded-full border-2">
                <User className="mr-2 w-5 h-5" />
                Để lại tên & lớp
              </Button>
            </div>
          )}
          
          {step === 'name' && (
            <form onSubmit={handleIdentified} className="space-y-4">
              <Input
                placeholder="Tên của em..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary"
                required
              />
              <Input
                placeholder="Lớp (không bắt buộc)..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="h-12 rounded-xl bg-muted/50 border-transparent focus-visible:ring-primary"
              />
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl">
                  Tiếp tục
                </Button>
              </div>
            </form>
          )}

          {step === 'mood' && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MOODS.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMood(m.label)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all ${m.bg} hover:scale-105`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${m.color}`} />
                    <span className="text-sm font-medium text-gray-700">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
