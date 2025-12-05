# Deployment Checklist - nghiaht.io.vn

## ✅ Pre-Deployment

- [ ] Đã test website hoạt động tốt trên local
- [ ] Đã backup database hiện tại (nếu có)
- [ ] Đã chuẩn bị thông tin database từ cPanel
- [ ] Đã có thông tin đăng nhập cPanel

## ✅ Build Frontend

- [ ] Chạy `cd frontend && npm run build`
- [ ] Kiểm tra thư mục `frontend/dist` đã được tạo
- [ ] Kiểm tra không có lỗi khi build

## ✅ Upload Frontend

- [ ] Mở File Manager trong cPanel
- [ ] Vào thư mục `public_html` (hoặc thư mục domain nghiaht.io.vn)
- [ ] Upload tất cả files từ `frontend/dist` lên `public_html`
- [ ] Tạo file `.htaccess` trong `public_html` (nội dung trong DEPLOYMENT_GUIDE.md)

## ✅ Setup Database

- [ ] Tạo database mới trong cPanel (MySQL Databases)
- [ ] Tạo user và gán quyền cho database
- [ ] Ghi lại: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- [ ] Import `backend/schema.sql` vào database qua phpMyAdmin

## ✅ Upload Backend

- [ ] Tạo thư mục cho backend (có thể là `api` hoặc ngoài public_html)
- [ ] Upload tất cả files từ thư mục `backend` lên server
- [ ] Tạo file `.env` trong thư mục backend với thông tin database

## ✅ Cấu Hình Backend

- [ ] Tạo file `.env` với đầy đủ thông tin:
  - [ ] DB_HOST
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] PORT
  - [ ] JWT_SECRET
- [ ] Cài đặt Node.js app trong cPanel (nếu có)
- [ ] Chạy `npm install` trong thư mục backend
- [ ] Khởi động Node.js application

## ✅ Cấu Hình Domain & SSL

- [ ] Kiểm tra domain nghiaht.io.vn đã trỏ về hosting
- [ ] Cài đặt SSL certificate (Let's Encrypt)
- [ ] Kiểm tra website chạy qua HTTPS

## ✅ Cấu Hình Frontend API URL

- [ ] Tạo file `.env.production` trong frontend với:
  ```
  VITE_API_URL=https://nghiaht.io.vn/api
  ```
- [ ] Build lại frontend: `npm run build`
- [ ] Upload lại files từ `frontend/dist`

## ✅ Testing

- [ ] Truy cập https://nghiaht.io.vn - website hiển thị đúng
- [ ] Truy cập https://nghiaht.io.vn/api - API trả về {"message":"WebPhim API running"}
- [ ] Test đăng ký/đăng nhập
- [ ] Test các chức năng chính của website
- [ ] Kiểm tra Console (F12) không có lỗi
- [ ] Kiểm tra Network tab - API calls thành công

## ✅ Post-Deployment

- [ ] Xóa các file không cần thiết (nếu có)
- [ ] Cấu hình backup tự động cho database
- [ ] Ghi lại thông tin quan trọng (passwords, secrets)
- [ ] Test lại sau 24h để đảm bảo mọi thứ hoạt động ổn định

