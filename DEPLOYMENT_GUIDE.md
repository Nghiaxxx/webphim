# Hướng Dẫn Deploy Website lên cPanel - nghiaht.io.vn

## Tổng Quan
Website của bạn gồm 2 phần:
- **Frontend**: React + Vite (giao diện người dùng)
- **Backend**: Node.js + Express + MySQL (API server)

## Bước 1: Chuẩn Bị Files

### 1.1. Build Frontend cho Production

Trên máy local của bạn, chạy lệnh:

```bash
cd frontend
npm run build
```

Lệnh này sẽ tạo thư mục `frontend/dist` chứa các file đã được build sẵn.

### 1.2. Chuẩn Bị Backend

Đảm bảo bạn có:
- File `backend/package.json`
- File `backend/src/index.js`
- File `backend/schema.sql` (để tạo database)

## Bước 2: Upload Files lên cPanel

### 2.1. Upload Frontend

1. Vào **File Manager** trong cPanel
2. Mở thư mục `public_html` (hoặc thư mục tương ứng với domain nghiaht.io.vn)
3. Upload **TẤT CẢ** các file trong thư mục `frontend/dist` lên `public_html`
   - Có thể upload từng file hoặc nén thành .zip rồi extract trong cPanel

**Cấu trúc sau khi upload:**
```
public_html/
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── ...
```

### 2.2. Upload Backend

1. Tạo thư mục `api` trong `public_html` (hoặc tạo thư mục riêng ngoài public_html)
2. Upload **TẤT CẢ** các file trong thư mục `backend` lên thư mục này

**Lưu ý:** Nếu cPanel hỗ trợ Node.js, bạn có thể đặt backend ở ngoài public_html để bảo mật hơn.

## Bước 3: Cấu Hình Database MySQL

### 3.1. Tạo Database trong cPanel

1. Vào **MySQL Databases** trong cPanel
2. Tạo database mới (ví dụ: `nghiaht_webphim`)
3. Tạo user mới và gán quyền cho database đó
4. Ghi lại thông tin:
   - Database name
   - Database username
   - Database password
   - Database host (thường là `localhost`)

### 3.2. Import Database Schema

1. Vào **phpMyAdmin** trong cPanel
2. Chọn database vừa tạo
3. Vào tab **Import**
4. Upload file `backend/schema.sql` và chạy import

## Bước 4: Cấu Hình Backend

### 4.1. Tạo File .env cho Backend

Trong thư mục backend trên server, tạo file `.env` với nội dung:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

# Server Configuration
PORT=4000
NODE_ENV=production

# JWT Secret (tạo một chuỗi ngẫu nhiên)
JWT_SECRET=your_super_secret_jwt_key_here
```

**Lưu ý:** Thay thế các giá trị bằng thông tin thực tế của bạn.

### 4.2. Cài Đặt Node.js (nếu cần)

1. Vào **Setup Node.js App** trong cPanel (nếu có)
2. Tạo Node.js application:
   - **Node.js version**: Chọn phiên bản mới nhất (18.x hoặc 20.x)
   - **Application root**: Đường dẫn đến thư mục backend
   - **Application URL**: `https://nghiaht.io.vn/api` (hoặc subdomain riêng)
   - **Application startup file**: `src/index.js`
3. Cài đặt dependencies:
   - Trong Node.js App manager, chạy: `npm install`
4. Khởi động ứng dụng

**Nếu không có Node.js App trong cPanel:**

Bạn có thể cần:
- Liên hệ nhà cung cấp hosting để bật Node.js
- Hoặc sử dụng PHP proxy để chuyển tiếp requests đến backend Node.js
- Hoặc deploy backend lên một server riêng (VPS, Heroku, Railway, etc.)

## Bước 5: Cấu Hình Frontend

### 5.1. Tạo File .env cho Frontend (nếu cần)

Nếu bạn muốn thay đổi API URL, tạo file `.env.production` trong thư mục `frontend` trước khi build:

```env
VITE_API_URL=https://nghiaht.io.vn/api
```

Sau đó build lại:
```bash
npm run build
```

### 5.2. Cấu Hình .htaccess (cho React Router)

Tạo file `.htaccess` trong `public_html` với nội dung:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

File này đảm bảo React Router hoạt động đúng khi người dùng truy cập trực tiếp vào các route.

## Bước 6: Cấu Hình Domain

### 6.1. Kiểm Tra Domain

1. Đảm bảo domain `nghiaht.io.vn` đã được trỏ về IP của hosting
2. Trong cPanel, kiểm tra **Addon Domains** hoặc **Subdomains** để đảm bảo domain đã được thêm

### 6.2. SSL Certificate

1. Vào **SSL/TLS Status** trong cPanel
2. Cài đặt SSL certificate miễn phí (Let's Encrypt) cho domain nghiaht.io.vn
3. Đảm bảo website chạy qua HTTPS

## Bước 7: Kiểm Tra và Test

### 7.1. Kiểm Tra Frontend

1. Truy cập `https://nghiaht.io.vn`
2. Kiểm tra xem website có hiển thị đúng không
3. Mở Developer Tools (F12) và kiểm tra Console xem có lỗi không

### 7.2. Kiểm Tra Backend API

1. Truy cập `https://nghiaht.io.vn/api` (hoặc URL backend của bạn)
2. Nếu thấy `{"message":"WebPhim API running"}` thì backend đã hoạt động

### 7.3. Kiểm Tra Kết Nối Database

1. Kiểm tra logs của backend (nếu có)
2. Thử đăng nhập/đăng ký trên website để test kết nối database

## Bước 8: Xử Lý CORS (nếu cần)

Nếu frontend và backend ở các domain khác nhau, bạn cần cấu hình CORS trong backend.

Trong `backend/src/index.js`, đảm bảo có:

```javascript
app.use(cors({
  origin: 'https://nghiaht.io.vn',
  credentials: true
}));
```

## Lưu Ý Quan Trọng

1. **Bảo Mật:**
   - Không commit file `.env` lên Git
   - Đảm bảo JWT_SECRET là một chuỗi ngẫu nhiên mạnh
   - Sử dụng HTTPS cho tất cả kết nối

2. **Performance:**
   - Enable gzip compression trong cPanel
   - Cân nhắc sử dụng CDN cho static assets

3. **Backup:**
   - Thường xuyên backup database
   - Backup files quan trọng

4. **Monitoring:**
   - Kiểm tra logs thường xuyên
   - Monitor resource usage trong cPanel

## Troubleshooting

### Lỗi 404 khi truy cập route trực tiếp
- Kiểm tra file `.htaccess` đã được tạo chưa
- Đảm bảo mod_rewrite đã được bật

### Backend không chạy
- Kiểm tra Node.js version
- Kiểm tra file `.env` có đúng không
- Kiểm tra logs trong Node.js App manager

### Database connection error
- Kiểm tra thông tin database trong `.env`
- Kiểm tra user có quyền truy cập database không
- Kiểm tra database host (có thể không phải `localhost`)

### CORS errors
- Cấu hình CORS trong backend để cho phép domain frontend
- Kiểm tra API URL trong frontend có đúng không

## Hỗ Trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs trong cPanel
2. Browser Console (F12)
3. Network tab trong Developer Tools

