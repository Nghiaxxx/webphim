## WebPhim - Đặt vé xem phim (React + Node.js + MySQL)

### 1. Cấu trúc project

- **backend**: API Node.js (Express) kết nối MySQL
- **frontend**: giao diện React (Vite) cho trang đặt vé

### 2. Chuẩn bị database MySQL

1. Mở MySQL (phpMyAdmin / Workbench / CLI).
2. Import file `backend/schema.sql`:
   - Chạy toàn bộ câu lệnh trong file đó.
   - Sẽ tạo database `webphim` và các bảng `movies`, `showtimes`, `bookings`.
3. Thêm vài dữ liệu mẫu:

```sql
USE webphim;

INSERT INTO movies (title, slug, poster_url, duration, rating, genre, description)
VALUES
('Avengers: Endgame', 'avengers-endgame', 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg', 181, 'C13', 'Hành động, Siêu anh hùng', 'Trận chiến cuối cùng với Thanos.'),
('Spider-Man: No Way Home', 'spider-man-no-way-home', 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', 148, 'C13', 'Hành động, Phiêu lưu', 'Đa vũ trụ mở ra với Spider-Man.');

INSERT INTO showtimes (movie_id, start_time, room, price)
VALUES
(1, '2025-12-01 19:30:00', 'A1', 90000),
(1, '2025-12-01 21:30:00', 'A1', 90000),
(2, '2025-12-01 20:00:00', 'B2', 100000);
```

### 3. Cấu hình backend

Vào thư mục `backend` và tạo file `.env` với nội dung tương tự:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=webphim
```

Thay `your_password` bằng mật khẩu MySQL thật của bạn (nếu user `root` có mật khẩu).

Sau đó cài dependencies và chạy:

```bash
cd backend
npm install
npm run dev   # hoặc: npm start
```

Backend chạy tại `http://localhost:4000`.

### 4. Chạy frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại `http://localhost:5173` và đã cấu hình proxy `/api` → `http://localhost:4000`.

### 5. Luồng đặt vé

- **Bước 1**: Trang chính hiển thị danh sách phim (từ API `/api/movies`).
- **Bước 2**: Chọn phim → hiển thị các suất chiếu (API `/api/showtimes?movieId=...`).
- **Bước 3**: Chọn suất chiếu → hiện sơ đồ ghế (ghế đã đặt lấy từ `/api/bookings/:showtimeId/seats`), nhập họ tên + SĐT.
- **Bước 4**: Bấm “Xác nhận đặt vé” → gửi `POST /api/bookings` lưu thông tin đặt ghế.


