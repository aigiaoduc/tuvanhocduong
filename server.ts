import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Cerebras from '@cerebras/cerebras_cloud_sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Rate limiting map: IP -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number, resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitData = rateLimitMap.get(ip);

  if (!limitData) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (now > limitData.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limitData.count >= 5) {
    return false;
  }

  limitData.count += 1;
  return true;
}

// Lazy initialize Cerebras client to avoid crashing if API key is missing on startup
let cerebrasClient: Cerebras | null = null;

function getCerebrasClient() {
  if (!cerebrasClient) {
    const apiKey = process.env['CEREBRAS_API_KEY'];
    if (!apiKey) {
      console.warn("CEREBRAS_API_KEY is missing. AI features will not work.");
    }
    cerebrasClient = new Cerebras({ apiKey });
  }
  return cerebrasClient;
}

const SYSTEM_INSTRUCTION = `
Vai trò: Cô giáo tư vấn tâm lý học đường tên là Minh (Cô Minh).
Tính cách: Thân thiện, gần gũi, điềm đạm, lắng nghe nhiều hơn nói, không phán xét, sử dụng ngôn từ tích cực và bao dung.
Cách xưng hô: Gọi học sinh là "em", "bạn" hoặc "con" (tùy ngữ cảnh) và xưng là "cô" hoặc "cô Minh".
Nguyên tắc trả lời: Luôn bắt đầu bằng việc xác nhận cảm xúc của học sinh.
Hãy trả lời ngắn gọn, ấm áp và tập trung vào việc giúp học sinh giải tỏa cảm xúc.
`;

app.post("/api/chat", async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Maximum 5 messages per minute.' });
    }

    const client = getCerebrasClient();
    const { prompt } = req.body;
    
    const completionCreateResponse = await client.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: prompt }
      ],
      model: 'qwen-3-235b-a22b-instruct-2507', 
    });
    
    res.json({ text: completionCreateResponse.choices[0].message.content });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.post("/api/moderate", async (req, res) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Rate limit exceeded. Maximum 5 messages per minute.' });
    }

    const client = getCerebrasClient();
    const { text } = req.body;
    const prompt = `Bạn là hệ thống kiểm duyệt nội dung tự động cho môi trường học đường. 
Nhiệm vụ của bạn là đánh giá xem văn bản sau có vi phạm các lỗi: tục tĩu, chửi thề, bạo lực, trêu đùa cợt nhả, spam, vô nghĩa hay không.
LƯU Ý QUAN TRỌNG: 
- Nếu học sinh đang CHỦ ĐỘNG chửi thề, xúc phạm, trêu đùa cợt nhả -> Trả lời "KHONG_HOP_LE".
- Nếu học sinh đang KỂ LẠI SỰ VIỆC bị người khác chửi/bắt nạt (ví dụ: "bạn A chửi em là...", "bạn đánh em") -> Đây là nạn nhân đang cần tâm sự, nội dung này an toàn -> Trả lời "HOP_LE".
- Nếu nội dung là tâm sự bình thường, nghiêm túc -> Trả lời "HOP_LE".

Trả lời CHÍNH XÁC 1 từ duy nhất: "HOP_LE" hoặc "KHONG_HOP_LE".

Văn bản cần kiểm duyệt: "${text}"`;

    const completionCreateResponse = await client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen-3-235b-a22b-instruct-2507',
    });
    
    const result = completionCreateResponse.choices[0].message.content?.trim().toUpperCase() || "";
    if (result.includes("KHONG_HOP_LE")) {
      res.json({ valid: false });
    } else {
      res.json({ valid: true });
    }
  } catch (error) {
    console.error("Moderate API Error:", error);
    res.json({ valid: true }); // Default to true on error
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
