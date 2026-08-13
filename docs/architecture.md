# Local-first architecture

## 1. Ứng dụng phải chạy mà không cần hạ tầng bên ngoài

Mọi route người dùng đều hoạt động sau `npm install && npm run dev`. Không có tài khoản, database,
API key, bước seed hay kết nối mạng bắt buộc. Dữ liệu nội dung được import trực tiếp từ các package
trong monorepo.

## 2. Nội dung và tiến độ là hai lớp riêng biệt

Từ vựng, câu hỏi và bài học là dữ liệu bất biến được quản lý bằng TypeScript. Tiến độ cá nhân là dữ
liệu nhỏ, riêng tư và được ghi vào `localStorage`. Thay nội dung không được âm thầm xóa tiến độ của
người học.

## 3. Bộ máy SRS không phụ thuộc kỳ thi

`packages/vocab-core` chỉ biết interval, ease factor, repetitions và lapses. Kiến thức TOEIC nằm
trong `packages/exam-profiles/toeic`. Thêm một kỳ thi mới nghĩa là thêm exam profile và dữ liệu,
không sửa thuật toán SM-2.

## 4. Chỉ từ “not sure” mới vào hàng đợi ôn tập

Trong bước quét nhanh, từ đã biết không được lên lịch. Từ chưa chắc được đưa vào hàng đợi ngay và
sau đó đi theo SM-2. Không có quota hằng ngày hoặc cơ chế ép duy trì streak.

## 5. Weakness Map lưu loại bẫy, không chỉ đúng/sai

Mỗi lỗi Listening/Reading được bộ phân loại rule-based gắn nhãn cụ thể như
`near_synonym_confusion`, `paraphrase_miss` hoặc `preposition_choice`. Weakness Map tổng hợp các
nhãn này trong cửa sổ 7 và 30 ngày từ dữ liệu cục bộ.
