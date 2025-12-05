# Checklist Deploy Backend lên Render

## ✅ Chuẩn Bị

- [ ] Code đã sẵn sàng trong thư mục `backend`
- [ ] `package.json` có script `start: "node src/index.js"`
- [ ] Đã test backend chạy được trên local
- [ ] Đã có tài khoản GitHub

## ✅ Push Code lên GitHub

- [ ] Đã khởi tạo git repository (`git init`)
- [ ] Đã commit code (`git commit -m "Initial commit"`)
- [ ] Đã tạo repository trên GitHub
- [ ] Đã push code lên GitHub (`git push`)

## ✅ Đăng Ký Render

- [ ] Đã đăng ký tài khoản Render (https://render.com)
- [ ] Đã kết nối GitHub account với Render

## ✅ Tạo Web Service

- [ ] Click "New +" → "Web Service"
- [ ] Đã chọn repository từ GitHub
- [ ] Đã cấu hình:
  - [ ] Name: `webphim-backend`
  - [ ] Root Directory: `backend` ⚠️ QUAN TRỌNG
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `node src/index.js`
  - [ ] Plan: `Free`

## ✅ Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `DB_HOST` = (database host)
- [ ] `DB_USER` = (database user)
- [ ] `DB_PASSWORD` = (database password)
- [ ] `DB_NAME` = (database name)
- [ ] `JWT_SECRET` = (random secret key)

## ✅ Database Setup

- [ ] Đã tạo database (PlanetScale/cPanel/PostgreSQL)
- [ ] Đã import `backend/schema.sql`
- [ ] Đã test kết nối database

## ✅ Deploy

- [ ] Click "Create Web Service"
- [ ] Đã chờ build và deploy hoàn tất
- [ ] Không có lỗi trong logs

## ✅ Test Backend

- [ ] Truy cập URL backend (ví dụ: `https://webphim-backend.onrender.com/api`)
- [ ] Thấy response: `{"message":"WebPhim API running"}`
- [ ] Test một vài API endpoints

## ✅ Cấu Hình Frontend

- [ ] Đã tạo `frontend/.env.production` với URL backend
- [ ] Đã build lại frontend (`npm run build`)
- [ ] Đã upload frontend lên cPanel

## ✅ Test Toàn Bộ

- [ ] Frontend load được
- [ ] API calls thành công
- [ ] Đăng nhập/đăng ký hoạt động
- [ ] Không có lỗi CORS
- [ ] Console không có lỗi

---

## URL Quan Trọng

- **Backend URL**: `https://webphim-backend.onrender.com`
- **API Endpoint**: `https://webphim-backend.onrender.com/api`
- **Frontend URL**: `https://nghiaht.io.vn`

---

## Lưu Ý

⚠️ **Root Directory**: Phải set = `backend`  
⚠️ **Database**: Render free chỉ có PostgreSQL, cần dùng PlanetScale hoặc MySQL từ cPanel  
⚠️ **Sleep**: Free tier có thể sleep sau 15 phút, request đầu tiên sẽ chậm  

---

## Nếu Gặp Lỗi

1. Kiểm tra **Logs** trong Render dashboard
2. Kiểm tra **Environment Variables** đã đúng chưa
3. Kiểm tra **Root Directory** = `backend`
4. Kiểm tra database connection

