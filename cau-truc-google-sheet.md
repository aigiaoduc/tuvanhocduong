# Cấu trúc Google Sheet

Tạo một Google Spreadsheet mới và tạo 6 trang tính (sheets) với tên chính xác như sau:

## 1. Sheet "Counseling" (Lưu lịch sử chat học sinh)
- Cột A: Thời gian (Time)
- Cột B: Session ID (Mã phiên chat)
- Cột C: Danh tính (ID)
- Cột D: Loại (Ẩn danh / Có tên)
- Cột E: Nội dung Chat (User & AI)

## 2. Sheet "Reports" (Lưu báo cáo)
- Cột A: Thời gian (Time)
- Cột B: Mã tra cứu (Ticket Code)
- Cột C: Danh tính (ID)
- Cột D: Loại (Ẩn danh / Có tên)
- Cột E: Nội dung báo cáo (Content)
- Cột F: Phản hồi từ Thầy/Cô (Reply) - Mặc định điền "Cô đã tiếp nhận thông tin. Em hãy quay lại sau 1-2 giờ để nhận câu trả lời nhé."

## 3. Sheet "Quotes" (Lưu lời chúc mỗi ngày)
- Cột A: Lời chúc (Quote)

## 4. Sheet "Gratitude" (Hộp thư biết ơn)
- Cột A: Thời gian (Time)
- Cột B: Người gửi (Sender)
- Cột C: Gửi đến ai (Receiver)
- Cột D: Lời nhắn (Message)

## 5. Sheet "ParentCounseling" (Lưu lịch sử chat phụ huynh)
- Cột A: Thời gian (Time)
- Cột B: Session ID (Mã phiên chat)
- Cột C: Nội dung Chat (Parent & AI)

## 6. Sheet "Admins" (Tài khoản quản trị)
- Cột A: Username (Tên đăng nhập)
- Cột B: Password (Mật khẩu)

## 7. Sheet "Library" (Cẩm nang tâm lý)
- Cột A: ID (Số thứ tự)
- Cột B: Tiêu đề (Title)
- Cột C: Nội dung (Content) - Hỗ trợ Markdown (dùng dấu Enter để xuống dòng, - để gạch đầu dòng) HOẶC link ảnh.
- Cột D: Loại (Type) - Điền "text" nếu cột C là bài viết, điền "image" nếu cột C là link ảnh.

## 8. Sheet "ImpactStats" (Con số ấn tượng)
- Cột A: Tháng Năm (VD: Tháng 4/2026)
- Cột B: Tư vấn AI (Số lượng)
- Cột C: Gửi thư hỗ trợ (Số lượng)
- Cột D: Góc Phụ huynh (Số lượng)
- Cột E: Hộp thư biết ơn (Số lượng)