import React, { useState, useEffect } from 'react';

export default function TypingMessage({ text, isTyping, onComplete }: { text: string, isTyping?: boolean, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);

  useEffect(() => {
    if (!isTyping) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 15); // 15ms per character

    return () => clearInterval(interval);
  }, [text, isTyping, onComplete]);

  return <>{displayedText}</>;
}
