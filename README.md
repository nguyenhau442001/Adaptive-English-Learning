# Adaptive English Learning

Ứng dụng học tiếng Anh local-first, gồm hai hướng luyện độc lập:

- **Vũ Đài TOEIC**: Listening, Reading, Speaking và Writing theo format bài thi.
- **Executive English Lab**: bài học C1–C2 cho software engineering tại môi trường tập đoàn kỹ
  thuật quốc tế, tập trung vào IT systems, architecture, API integration, incident, requirements,
  code review và release. Mỗi bài đi theo luồng học kiến thức → xem hội thoại mẫu → làm bài tập →
  luyện lại câu sai.

Không cần tài khoản, database, API key hay file `.env`. Nội dung được đóng gói trong repository;
tiến độ, SRS từ vựng, lỗi thường gặp và điểm bài học được lưu bằng `localStorage` trên trình duyệt.

## Chạy trên máy

Yêu cầu Node.js 22+.

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Không mở `vu-dai-toeic.html` bằng Live Server;
đó chỉ là bản demo HTML cũ và không dùng chung asset pipeline với ứng dụng Next.js.

## Build production

```bash
npm run build
npm run start --workspace=web
```

Không cần cấu hình biến môi trường khi deploy. Với Vercel, đặt **Root Directory** thành `apps/web`.

## Dữ liệu được lưu ở đâu?

Mọi dữ liệu cá nhân chỉ nằm trong trình duyệt hiện tại:

- tiến độ đấu trường và trang bị nhân vật;
- bài Executive English đã học, điểm tốt nhất và số lần luyện;
- trạng thái SRS của từ vựng;
- Weakness Map được tạo từ câu trả lời sai.

Xóa dữ liệu website trong trình duyệt sẽ đặt lại toàn bộ tiến độ. Dữ liệu không tự đồng bộ giữa
các thiết bị hoặc trình duyệt.

## Nội dung và cách chấm

- Ngân hàng từ vựng, câu hỏi TOEIC và bài Executive English đều là dữ liệu cục bộ do dự án quản lý.
- Listening dùng Speech Synthesis của trình duyệt.
- Speaking dùng Web Speech API khi trình duyệt hỗ trợ.
- Speaking/Writing được chấm bằng heuristic nội bộ dựa trên rubric; không gọi dịch vụ AI trả phí.
- Điểm luyện tập là tín hiệu định hướng, không phải kết quả chính thức do ETS cấp.

## Cấu trúc monorepo

- `apps/web` — ứng dụng Next.js App Router.
- `packages/vocab-core` — bộ máy SM-2 thuần TypeScript.
- `packages/exam-profiles/toeic` — từ vựng, câu hỏi và taxonomy lỗi TOEIC.
- `docs/architecture.md` — nguyên tắc kiến trúc local-first.
