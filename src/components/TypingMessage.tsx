import React, { useState, useEffect, useRef } from 'react';

export default function TypingMessage({ text, isTyping, onComplete }: { text: string, isTyping?: boolean, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState(isTyping ? '' : text);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 15); // 15ms per character

    return () => clearInterval(interval);
  }, [text, isTyping]);

  return <>{displayedText}</>;
}
