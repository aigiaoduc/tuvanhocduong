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
      // Speed up by adding 2 characters at a time
      i += 2;
      setDisplayedText(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, 10); // 10ms per 2 characters (effectively 5ms per char)

    return () => clearInterval(interval);
  }, [text, isTyping]);

  return <>{displayedText}</>;
}
