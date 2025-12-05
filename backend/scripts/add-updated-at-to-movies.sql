-- Migration script: Thêm cột updated_at vào bảng movies
-- Chạy script này để thêm cột updated_at nếu chưa có

USE webphim;

-- Kiểm tra và thêm cột updated_at nếu chưa tồn tại
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Nếu MySQL version không hỗ trợ IF NOT EXISTS, dùng cách này:
-- ALTER TABLE movies 
-- ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
-- AFTER created_at;

