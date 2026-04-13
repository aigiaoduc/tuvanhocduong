import { UserIdentity } from '../types';
import { GOOGLE_SCRIPT_URL } from '../config';

export const sendCounselingData = async (identity: UserIdentity, sessionId: string, userText: string, modelText: string) => {
  const data = {
    sheet: 'Counseling',
    id: identity.id,
    sessionId: sessionId,
    type: identity.type === 'anonymous' ? '[ẨN DANH]' : '[CÓ TÊN]',
    chat: `User: ${userText} | AI: ${modelText}`,
    time: new Date().toISOString()
  };

  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Lỗi khi gửi dữ liệu chat:", e);
    }
  } else {
    console.log(data);
  }
};

export const sendReportData = async (identity: UserIdentity, ticketCode: string, content: string) => {
  const data = {
    sheet: 'Reports',
    id: identity.id,
    ticketCode: ticketCode,
    type: identity.type === 'anonymous' ? '[ẨN DANH]' : '[CÓ TÊN]',
    content: content,
    time: new Date().toISOString()
  };

  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Lỗi khi gửi báo cáo:", e);
    }
  } else {
    console.log(data);
  }
};

export const sendGratitudeData = async (sender: string, receiver: string, message: string) => {
  const data = {
    sheet: 'Gratitude',
    sender: sender || 'Ẩn danh',
    receiver: receiver,
    message: message,
    time: new Date().toISOString()
  };

  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Lỗi khi gửi lời biết ơn:", e);
    }
  } else {
    console.log(data);
  }
};

export const sendParentCounselingData = async (sessionId: string, userText: string, modelText: string) => {
  const data = {
    sheet: 'ParentCounseling',
    sessionId: sessionId,
    chat: `Parent: ${userText} | AI: ${modelText}`,
    time: new Date().toISOString()
  };

  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error("Lỗi khi gửi dữ liệu chat phụ huynh:", e);
    }
  } else {
    console.log(data);
  }
};

export const checkTicketStatus = async (ticketCode: string): Promise<string | null> => {
  if (!GOOGLE_SCRIPT_URL) {
    return "Đang xác minh (Bản nháp)";
  }
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkTicket&code=${ticketCode}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.status === 'success') {
      return result.ticketStatus;
    }
    return null;
  } catch (e) {
    console.error("Lỗi khi tra cứu mã:", e);
    return "Không thể kết nối đến máy chủ (Lỗi CORS/Mạng).";
  }
};

export const getDailyQuote = async (): Promise<string> => {
  if (!GOOGLE_SCRIPT_URL) {
    return "Điểm số không định nghĩa con người em. Hôm nay em đã vất vả rồi!";
  }
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getQuote`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.quote) {
      return result.quote;
    }
    return "Chúc em một ngày tốt lành! (Chưa có dữ liệu từ Sheet)";
  } catch (e) {
    console.error("Lỗi khi lấy lời chúc:", e);
    return "Chúc em một ngày tốt lành! (Lỗi kết nối)";
  }
};

export interface LibraryItem {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image';
}

export const fetchLibraryData = async (): Promise<LibraryItem[]> => {
  if (!GOOGLE_SCRIPT_URL) {
    return [
      { id: '1', title: 'Cách hít thở khi hoảng loạn', content: '1. Hít vào 4 giây\n2. Giữ hơi 7 giây\n3. Thở ra 8 giây\n\nLặp lại 4 lần.', type: 'text' },
      { id: '2', title: 'Bí kíp quản lý thời gian mùa thi', content: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000', type: 'image' }
    ];
  }
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getLibrary`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.data) {
      return result.data;
    }
    return [];
  } catch (e) {
    console.error("Lỗi khi lấy thư viện:", e);
    return [
      { id: '1', title: 'Cách hít thở khi hoảng loạn', content: '1. Hít vào 4 giây\n2. Giữ hơi 7 giây\n3. Thở ra 8 giây\n\nLặp lại 4 lần.', type: 'text' },
      { id: '2', title: 'Bí kíp quản lý thời gian mùa thi', content: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1000', type: 'image' }
    ];
  }
};

export interface ImpactStat {
  month: string;
  chatCount: number;
  reportCount: number;
  parentCount: number;
  gratitudeCount: number;
}

export const fetchImpactStats = async (): Promise<ImpactStat[]> => {
  if (!GOOGLE_SCRIPT_URL) {
    return [
      { month: 'Tháng 4/2026', chatCount: 1250, reportCount: 45, parentCount: 120, gratitudeCount: 350 },
      { month: 'Tháng 3/2026', chatCount: 980, reportCount: 32, parentCount: 85, gratitudeCount: 210 },
      { month: 'Tháng 2/2026', chatCount: 850, reportCount: 28, parentCount: 60, gratitudeCount: 180 }
    ];
  }
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getImpactStats`);
    if (!response.ok) throw new Error("Network response was not ok");
    const result = await response.json();
    if (result.data) {
      return result.data;
    }
    return [];
  } catch (e) {
    console.error("Lỗi khi lấy dữ liệu thống kê:", e);
    return [
      { month: 'Tháng 4/2026', chatCount: 1250, reportCount: 45, parentCount: 120, gratitudeCount: 350 },
      { month: 'Tháng 3/2026', chatCount: 980, reportCount: 32, parentCount: 85, gratitudeCount: 210 },
      { month: 'Tháng 2/2026', chatCount: 850, reportCount: 28, parentCount: 60, gratitudeCount: 180 }
    ];
  }
};

