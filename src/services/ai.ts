export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.text || 'Xin lỗi em, cô Minh đang gặp chút sự cố kết nối.';
  } catch (error) {
    console.error("Chat error:", error);
    return 'Xin lỗi em, hiện tại hệ thống đang bận. Em thử lại sau một lát nhé.';
  }
};

export const moderateContent = async (text: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Error moderating content:", error);
    return true; // Default to true on error
  }
};
