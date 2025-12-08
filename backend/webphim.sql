-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1

-- Tắt foreign key checks tạm thời để import dữ liệu
SET FOREIGN_KEY_CHECKS = 0;
-- Thời gian đã tạo: Th12 05, 2025 lúc 07:37 AM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `webphim`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `user_id` int(11) DEFAULT NULL COMMENT 'User đặt vé (NULL nếu đặt không đăng nhập)',
  `showtime_id` int(11) NOT NULL,
  `booking_code` varchar(50) DEFAULT NULL COMMENT 'Mã đặt vé (VD: BK20250101001)',
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `seat_row` int(11) NOT NULL,
  `seat_col` int(11) NOT NULL,
  `original_price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền gốc',
  `discount_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Số tiền được giảm',
  `total_price` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Tổng tiền sau giảm giá',
  `payment_method` enum('cash','card','momo','zalopay','bank_transfer') DEFAULT 'cash',
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `status` enum('confirmed','cancelled','completed','expired') DEFAULT 'confirmed',
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `qr_code` varchar(500) DEFAULT NULL COMMENT 'QR code để check-in',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_products`
--

DROP TABLE IF EXISTS `booking_products`;
CREATE TABLE `booking_products` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `booking_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_products`
-- Comment lại vì không có booking_id tương ứng
--

-- INSERT INTO `booking_products` (`id`, `booking_id`, `product_id`, `quantity`, `unit_price`, `subtotal`, `created_at`) VALUES
-- (1, 1, 1, 1, 119000.00, 119000.00, '2025-12-02 10:35:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_seats`
--

DROP TABLE IF EXISTS `booking_seats`;
CREATE TABLE `booking_seats` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `booking_id` int(11) NOT NULL,
  `seat_row` varchar(5) NOT NULL COMMENT 'A, B, C...',
  `seat_col` int(11) NOT NULL COMMENT '1, 2, 3...',
  `seat_code` varchar(10) NOT NULL COMMENT 'A5, B12...',
  `seat_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `seat_type` enum('Standard','VIP','Couple') DEFAULT 'Standard',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_seats`
-- Comment lại vì không có booking_id tương ứng
--

-- INSERT INTO `booking_seats` (`id`, `booking_id`, `seat_row`, `seat_col`, `seat_code`, `seat_price`, `seat_type`, `created_at`) VALUES
-- (1, 1, 'E', 5, 'E5', 85000.00, 'Standard', '2025-12-02 10:35:42'),
-- (2, 1, 'E', 6, 'E6', 85000.00, 'Standard', '2025-12-02 10:35:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_vouchers`
--

DROP TABLE IF EXISTS `booking_vouchers`;
CREATE TABLE `booking_vouchers` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `booking_id` int(11) NOT NULL,
  `voucher_id` int(11) DEFAULT NULL COMMENT 'Nếu dùng voucher',
  `promotion_id` int(11) DEFAULT NULL COMMENT 'Nếu dùng promotion tự động',
  `user_voucher_id` int(11) DEFAULT NULL COMMENT 'Link đến user_vouchers nếu dùng voucher',
  `discount_amount` decimal(10,2) NOT NULL COMMENT 'Số tiền được giảm',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cinemas`
--

DROP TABLE IF EXISTS `cinemas`;
CREATE TABLE `cinemas` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `cinemas`
--

INSERT INTO `cinemas` (`id`, `name`, `address`, `phone_number`, `city`) VALUES
(1, 'Cinestar Quốc Thanh', '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM', NULL, 'TP.HCM'),
(2, 'Cinestar Hai Bà Trưng', '135 Hai Bà Trưng, Phường Sài Gòn, TP.HCM', NULL, 'TP.HCM'),
(3, 'Cinestar Sinh Viên', 'Nhà văn hóa Sinh Viên, Đại học Quốc Gia HCM, Phường Đông Hòa, TP.HCM', NULL, 'TP.HCM'),
(4, 'Cinestar Huế', '25 Hai Bà Trưng, Phường Thuận Hóa, Thành phố Huế', NULL, 'TP.Huế'),
(5, 'Cinestar Đà Lạt', 'Quảng trường Lâm Viên, góc đường Hồ Tùng Mậu và Trần Quốc Toản, Phường Xuân Hương - Đà Lạt, Tỉnh Lâm Đồng', NULL, 'Lâm Đồng'),
(6, 'Cinestar Lâm Đồng', 'Tầng 4, Trung tâm Thương mại và Dịch vụ tài chính Sacombank, 713 Quốc lộ 20, Xã Đức Trọng, Tỉnh Lâm Đồng', NULL, 'Đức Trọng'),
(7, 'Cinestar Mỹ Tho', 'Số 52 Đinh Bộ Lĩnh, Phường Mỹ Tho, Tỉnh Đồng Tháp', NULL, 'Đồng Tháp'),
(8, 'Cinestar Kiên Giang', 'Lô A2 - Khu 2 Trung tâm Thương mại Rạch Sỏi, đường Nguyễn Chí Thanh, Phường Rạch Giá, Tỉnh An Giang', NULL, 'An Giang'),
(9, 'Cinestar Satra Quận 6', 'Tầng 6, TTTM Satra Võ Văn Kiệt, 1466 Võ Văn Kiệt, Phường 1, Quận 6, TP.HCM', NULL, 'TP.HCM');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
CREATE TABLE `loyalty_transactions` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL COMMENT 'Nếu tích điểm từ đặt vé',
  `points` int(11) NOT NULL COMMENT 'Số điểm (âm nếu đã dùng)',
  `type` enum('earned','used','expired','admin_adjust') DEFAULT 'earned',
  `description` varchar(255) DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Điểm hết hạn sau bao lâu',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `movies`
--

DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `poster_url` varchar(500) DEFAULT NULL,
  `trailer_url` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `rating` varchar(50) DEFAULT NULL,
  `genre` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('now_showing','coming_soon','ended') NOT NULL DEFAULT 'coming_soon',
  `release_date` date DEFAULT NULL,
  `director` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `movies`
--

INSERT INTO `movies` (`id`, `title`, `slug`, `poster_url`, `trailer_url`, `duration`, `rating`, `genre`, `country`, `subtitle`, `description`, `created_at`, `updated_at`, `status`, `release_date`, `director`) VALUES
(1, 'TAFITI - NÁO LOẠN SA MẠC (P) LT', 'tafiti-nao-loan-sa-mac', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Ftafiti.jpg&w=384&q=50', 'https://www.youtube.com/embed/n9Jv1bEjSgk?si=EZYWHtHjdEBy2-DS', 80, 'P', 'Hoạt hình', 'Khác', 'Lồng tiếng', 'Chú chồn đất Tafiti vốn chỉ mong một cuộc sống yên bình giữa thảo nguyên nhưng cứ bị chú heo rừng hậu đậu, tốt bụng Bristles làm đảo lộn mọi thứ.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', '2025-11-21', 'Nian Wels'),
(2, 'CƯỚI VỢ CHO CHA (T13)', 'cuoi-vo-cho-cha', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fcuoi-vo-cho-cha-poster.png&w=384&q=50', 'https://www.youtube.com/embed/1ffxVmHB4Hk?si=r2VgBnU8QBQkQDv5', 112, 'T13', 'Hài, Gia đình', 'Việt Nam', 'VN', 'Bộ phim hài gia đình Việt Nam kể về câu chuyện vui nhộn xoay quanh việc cưới vợ cho cha.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', NULL, NULL),
(3, 'KỲ AN NGHỈ (T18)', 'ky-an-nghi', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fky-an-nghi.jpg&w=384&q=50', 'https://www.youtube.com/embed/JJZU5ZXKEnk?si=D9YMEcdoirP8UVFY', 99, 'T18', 'Kinh Dị', 'Khác', 'Phụ đề', 'Bộ phim kinh dị đầy bí ẩn về một kỳ an nghỉ đầy ám ảnh.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', NULL, NULL),
(4, 'ANH TRAI SAY XE (T16)', 'anh-trai-say-xe', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fanh-trai-say-xe.jpg&w=640&q=50', 'https://www.youtube.com/embed/15FPFsXcR-c?si=_A_lCnpJaRSWvikA', 110, 'T16', 'Hài, Gia đình', 'Hàn Quốc', 'Lồng tiếng', 'Bộ phim hài Hàn Quốc về những tình huống dở khóc dở cười.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', NULL, NULL),
(5, '5 CENTIMET TRÊN GIÂY (T13)', '5-centimet-tren-giay', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2F5cm.jpg&w=640&q=50', 'https://youtu.be/WI0_CiynFW8?si=PVbw5oIUjxXxbtPV', 63, 'T13', 'Tình Cảm, Anime', 'Khác', 'Phụ đề', 'Bộ phim anime tình cảm xúc động về khoảng cách và tình yêu.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'coming_soon', NULL, NULL),
(6, 'CHÚ THUẬT HỒI CHIẾN: BIẾN CỐ SHIBUYA', 'chu-thuat-hoi-chien-bien-co-shibuya', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2Fjujutsu-kaisen.jpg&w=640&q=50', NULL, 120, 'C', 'Anime', NULL, NULL, 'Bộ phim anime hành động về biến cố Shibuya.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'coming_soon', NULL, NULL),
(7, 'MA LỦNG TƯỜNG (T18)', 'ma-lung-tuong', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2Fma-lung-tuong-poster.jpg&w=640&q=50', NULL, 95, 'T18', 'Kinh Dị', NULL, NULL, 'Bộ phim kinh dị về những bí mật đáng sợ ẩn sau bức tường.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'coming_soon', NULL, NULL),
(8, '96 PHÚT SINH TỬ (PĐ)', '96-phut-sinh-tu', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2F96M.jpg&w=640&q=50', NULL, 96, 'C', 'Hành Động', NULL, NULL, 'Bộ phim hành động căng thẳng về 96 phút đấu tranh sinh tử.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'coming_soon', NULL, NULL),
(9, 'GANGSTER VỀ LÀNG (T16) LT', 'gangster-ve-lang', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fgangster-ve-lang.jpg&w=384&q=50', 'https://youtu.be/6P5Nt6RdeZY?si=xoNgN0VsqS-s4V11', 102, 'T16', 'Hài', 'Khác', 'Phụ đề', 'Gangster về làng', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', NULL, NULL),
(10, 'HOÀNG TỬ QUỶ (T18)', 'hoang-tu-quy', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2Fhoang-tu-quy-main.png&w=384&q=50', 'https://youtu.be/oLxbSoA389c?si=ZShksa-Xn_WWyLlo', 117, 'T18', 'Kinh dị', 'Việt Nam', 'VN', 'Hoàng Tử Quỷ xoay quanh Thân Đức - một hoàng tử được sinh ra nhờ tà thuật.', '2025-12-02 10:35:42', '2025-12-04 10:59:22', 'now_showing', '2025-12-05', NULL),
(13, 'PHI VỤ ĐỘNG TRỜI 2 (P) LT\r\n', 'phi-vu-dong-troi-2-lt', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fzootopia-2_1.jpg&w=384&q=50', 'https://www.youtube.com/embed/5O3LEps6WJY?si=wgLtbiUp96HgV92C', 99, 'P', 'Hoạt hình', 'Khác', 'Lồng tiếng', 'ZOOTOPIA 2 trở lại sau 9 năm Đu OTP Nick & Judy chuẩn bị 28.11.2025 này ra rạp nhé\r\n\r\n', '2025-12-03 21:25:39', '2025-12-04 10:59:22', 'now_showing', '2025-11-28', 'Jared Bush, Byron Howard'),
(14, '5 CENTIMET TRÊN GIÂY (T13)\r\n', '5-centimet-tren-giay-pd', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2F5cm.jpg&w=384&q=50', 'https://youtu.be/WI0_CiynFW8?si=b6V-bmIYNpHSDrP1', 76, 'T13', 'Tình cảm, Anime', 'Nhật Bản', 'Phụ đề', 'Câu chuyện cảm động về Takaki và Akari, đôi bạn thuở thiếu thời dần bị chia cắt bởi thời gian và khoảng cách. Qua ba giai đoạn khác nhau trong cuộc đời, hành trình khắc họa những ký ức, cuộc hội ngộ và sự xa cách của cặp đôi, với hình ảnh hoa anh đào rơi – 5cm/giây – như ẩn dụ cho tình yêu mong manh và thoáng chốc của tuổi trẻ.\r\n\r\n', '2025-12-03 21:25:39', '2025-12-04 10:59:22', 'now_showing', '2025-12-05', 'Shinkai Makoto\r\n'),
(16, 'TRUY TÌM LONG DIÊN HƯƠNG (T16)\r\n', 'truy-tim-ldh', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Ftruy-tien-long-dien-huong-poster.jpg&w=1920&q=75', 'https://youtu.be/fO6X58qWA_s?si=PqBmxSks0hTM79Gj', 103, 'T16', 'Hài, Hành động', 'Việt Nam', 'VN', 'Ngay trước thềm lễ hội lớn, bảo vật linh thiêng Long Diên Hương bất ngờ bị đánh cắp, kéo theo hai anh em Tâm - Tuấn cùng nhóm bạn vào chuyến hành trình nghẹt thở nhưng không kém phần hài hước khi họ phải chạm trán với các băng nhóm ngư dân xã hội đen cùng nhiều hiểm nguy.\r\n\r\n', '2025-12-03 21:28:42', '2025-12-04 10:59:22', 'now_showing', '2025-11-14', 'Dương Minh Chiến'),
(17, 'PHIÊN CHỢ CỦA QUỶ (T18)\r\n', 'phien-cho-cua-quy', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F12-2025%2Fphien-cho-cua-quy.jpg&w=1920&q=75', 'https://youtu.be/dLmJv83Djyc?si=mFzP4VtUbmwUbQf7', 97, 'T18', 'Kinh Dị', 'Khác', 'Phụ Đề', 'Phiên chợ của quỷ - Nơi linh hồn trở thành những món hàng để thỏa mãn tham vọng của con người. Mỗi đêm, cổng chợ âm sẽ mở, quỷ sẽ bắt hồn. Một khi đã dám bán rẻ linh hồn, cái giá phải trả có thể là máu, là thịt, hoặc chính sự tồn tại của những kẻ dám liều mạng. Nỗi ám ảnh không lối thoát với phim tâm linh - kinh hợp tác Việt - Hàn quỷ dị nhất dịp cuối năm!\r\n\r\n', '2025-12-03 21:31:31', '2025-12-04 10:59:22', 'now_showing', '2025-11-28', 'Hong Won Ki'),
(18, 'QUÁN KỲ NAM (T16)\r\n', 'quan-ky-nam', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fquan-ky-nam-poster.jpg&w=1920&q=75', 'https://youtu.be/27dgpqiI0VU?si=-aq0nsGjGq_9KQs2', 135, 'T16', 'Tâm Lý', 'Việt Nam', 'VN', 'Với sự nâng đỡ của người chú quyền lực, Khang được giao cho công việc dịch cuốn “Hoàng Tử Bé” và dọn vào căn hộ bỏ trống ở khu chung cư cũ. Anh làm quen với cô hàng xóm tên Kỳ Nam, một góa phụ từng nổi danh trong giới nữ công gia chánh và giờ lặng lẽ với nghề nấu cơm tháng. Một tai nạn xảy ra khiến Kỳ Nam không thể tiếp tục công việc của mình. Khang đề nghị giúp đỡ và mối quan hệ của họ dần trở nên sâu sắc, gắn bó. Liệu mối quan hệ của họ có thể tồn tại lâu dài giữa những biến động củа xã hội thời bấy giờ?\r\n\r\n', '2025-12-03 21:31:31', '2025-12-04 12:49:47', 'now_showing', '2025-11-27', 'Lê Nhật Quang'),
(19, 'PHÒNG TRỌ MA BẦU (T16)\r\n', 'phong-tro-ma-bau', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fphong-tro-ma-bay-payoff.jpg&w=1920&q=75', 'https://youtu.be/aCI_-1TNlkk?si=gDR0TL4mif6hjbMI', 102, 'T16', 'Hài, Kinh Dị\r\n', 'Việt Nam\r\n', 'VN', 'Hai người bạn thân thuê phải một căn phòng trọ cũ, nơi liên tục xảy ra những hiện tượng kỳ bí. Trong hành trình tìm hiểu, họ đối mặt với hồn ma của một người phụ nữ mang thai – “ma bầu”. Ẩn sau nỗi ám ảnh rùng rợn là bi kịch và tình yêu mẫu tử thiêng liêng, nơi sự hy sinh của người mẹ trở thành sợi dây kết nối những thế hệ.\r\n\r\n', '2025-12-03 21:34:46', '2025-12-04 10:59:22', 'now_showing', '2025-11-28', 'Ngụy Minh Khang'),
(20, 'PHI VỤ ĐỘNG TRỜI 2 (P) (PĐ)\r\n', 'phi-vu-dong-troi-phu-de', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2Fwysiwyg%2FPosters%2F11-2025%2Fzootopia-2_1.jpg&w=1920&q=75', 'https://youtu.be/5O3LEps6WJY?si=fjk1lHXQ3cOezn5J', 117, 'P', 'Hoạt hình\r\n', 'Khác', 'Phụ Đề\r\n', 'ZOOTOPIA 2 trở lại sau 9 năm Đu OTP Nick & Judy chuẩn bị 28.11.2025 này ra rạp nhé\r\n\r\n', '2025-12-03 21:34:46', '2025-12-04 10:59:22', 'now_showing', '2025-11-28', 'Jared Bush, Byron Howard');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `type` enum('combo','drink','bottled_drink','snack','poca') NOT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `details`, `price`, `image_url`, `type`, `is_featured`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'COMBO GẤU', '1 Coke 32oz + 1 Bắp 2 Ngăn', '64OZ Phô Mai + Caramel', 119000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117', 'combo', 0, 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(2, 'COMBO NHÀ GẤU', '4 Coke 22oz + 2 Bắp 2 Ngăn', '64OZ Phô Mai + Caramel', 259000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117', 'combo', 1, 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(3, 'COMBO CÓ GẤU', '2 Coke 32oz + 1 Bắp 2 Ngăn', '64OZ Phô Mai + Caramel', 129000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS036_COMBO_CO_GAU.png?rand=1723084117', 'combo', 0, 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(4, 'FANTA 32OZ', NULL, NULL, 37000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/fanta.jpg?rand=1719572506', 'drink', 0, 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(5, 'SPRITE 32OZ', NULL, NULL, 37000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/sprite.png?rand=1719572953', 'drink', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:55:34'),
(6, 'COKE ZERO 32OZ', NULL, NULL, 37000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/COKE-ZERO.png?rand=1719573157', 'drink', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:55:49'),
(7, 'COKE 32OZ', NULL, NULL, 37000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/coca.png?rand=1719572301', 'drink', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:53:16'),
(8, 'NƯỚC SUỐI DASANI', NULL, '500/510ML', 20000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/dasani.png?rand=1719572623', 'bottled_drink', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:54:58'),
(9, 'NƯỚC TRÁI CÂY NUTRIBOOST', NULL, '297ML', 28000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/NUTRI.png?rand=1719572506', 'bottled_drink', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:55:13'),
(10, 'SNACK THÁI', NULL, NULL, 25000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/snack-que-thai.png?rand=1718957425', 'snack', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:54:42'),
(11, 'POCA KHOAI TÂY 54GR', NULL, NULL, 28000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/lays-khoai-tay.png?rand=1719572623', 'poca', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:54:10'),
(12, 'POCA WAVY 54GR', NULL, NULL, 28000.00, 'https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/lays-vi-bo_1_.png?rand=1719632844', 'poca', 0, 1, '2025-12-02 10:35:42', '2025-12-04 16:53:53');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `image_url` varchar(512) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `conditions_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`conditions_json`)),
  `notes_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notes_json`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`id`, `title`, `slug`, `image_url`, `description`, `start_date`, `end_date`, `conditions_json`, `notes_json`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'HAPPY DAY | THỨ 4 – ĐỒNG GIÁ 45K DÀNH CHO THÀNH VIÊN CINESTAR', 'uudai-gia-ve-hssv-cschool', 'https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Promotions/THU_4.jpg', 'Thứ 4 hàng tuần, đồng giá 45K / vé 2D dành riêng cho khách hàng là thành viên Cinestar', '2025-11-29', '2026-02-28', '[\"Đồng giá 45.000đ / vé 2D;\",\"Đồng giá 55.000đ/ vé 3D;\",\"Đồng giá 95.000đ/ vé C\'MÊ (giường nằm).\"]', '[\"Khách hàng thành viên có thể mua trực tiếp tại rạp, app/web Cinestar.\",\"Không áp dụng vào các ngày Lễ, Tết.\"]', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(2, 'HAPPY DAY | THỨ 2 – ĐỒNG GIÁ 45K CHO MỌI SUẤT CHIẾU', 'uudai-gia-ve-hssv-cschool-clone', 'https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Promotions/MONDAY.jpg', 'Thứ 2 hàng tuần, đồng giá vé 45K / vé 2D cho mọi khách hàng', '2025-11-29', '2026-02-28', '[\"Đồng giá 45.000đ / vé 2D;\",\"Đồng giá 55.000đ/ vé 3D;\"]', '[\"Khách hàng có thể mua trực tiếp tại rạp, app/web Cinestar.\",\"Không áp dụng vào các ngày Lễ, Tết.\"]', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(4, 'C’SCHOOL | ƯU ĐÃI GIÁ VÉ TỪ 45K DÀNH RIÊNG CHO HSSV/U22/GIÁO VIÊN \r\n', 'uu-dai', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2FMageINIC%2Fbannerslider%2FHSSV-2.jpg&w=1920&q=75', 'Ưu đãi giá vé chỉ từ 45K dành cho Học sinh Sinh viên, U22 và Giáo viên cả tuần\r\n\r\n', '2025-11-29', '2026-02-28', '[\r\n    \"Giá vé ưu đãi 45.000đ/ vé 2D áp dụng vào: Thứ 2 và các suất chiếu trước 10h00;\",\r\n    \"Giá vé ưu đãi 49.000đ/ vé 2D áp dụng tất cả các suất chiếu còn lại;\",\r\n    \"Giá vé ưu đãi 55.000đ/ vé 3D áp dụng tất cả các suất chiếu trước 10h00 và sau 22h00;\",\r\n    \"Giá vé ưu đãi 95.000đ/ C’MÊ (giường nằm) áp dụng vào: thứ 2 và các suất chiếu trước 10h00 (Thứ 3, 4, 5) tại Cinestar Quốc Thanh, Cinestar Hai Bà Trưng, Cinestar Satra Quận 6.\",\r\n    \"Giá vé ưu đãi 99.000đ/ C’MÊ (giường nằm) áp dụng vào: thứ 3, 4, 5 tại Cinestar Quốc Thanh, Cinestar Hai Bà Trưng, Cinestar Satra Quận 6\"\r\n]', '[\r\n    \"Khách hàng là Học sinh Sinh viên đang mặc đồng phục trường học hoặc xuất trình thẻ Học sinh sinh viên / hình ảnh thẻ Học sinh Sinh viên chính chủ có thể xác minh;\",\r\n    \"Khách hàng từ 22 tuổi trở xuống (có năm sinh từ 2003 trở lên) có thể xuất trình Căn cước/ VNeID / hình ảnh Căn cước chính chủ hoặc giấy tờ tùy thân có thể xác minh như Bằng lái xe, …;\",\r\n    \"Khách hàng là giáo viên/ giảng viên xuất trình chứng chỉ sư phạm, hoặc thẻ giáo viên / giảng viên hoặc hình ảnh thẻ giáo viên/giảng viên chính chủ có thể xác minh.\",\r\n    \"Mỗi thẻ HSSV/U22/GV, khách hàng chỉ mua được 01 vé trên 01 suất chiếu;\",\r\n    \"Học sinh Sinh viên/ U22 có thể đặt vé với giá ưu đãi tại app Cinestar hoặc web cinestar.com.vn;\",\r\n    \"Học sinh Sinh viên/ U22 có thể áp dụng giá vé ưu đãi đối với các suất chiếu sớm/ suất chiếu đặc biệt tùy theo quy định từ nhà phát hành phim;\",\r\n    \"Không áp dụng vào các ngày Lễ, Tết.\"\r\n]', 1, '2025-12-02 22:17:33', '2025-12-02 22:17:33'),
(6, 'HAPPY HOUR | TRƯỚC 10H VÀ SAU 22H – GIÁ VÉ ƯU ĐÃI CHỈ TỪ 45K \r\n', 'uu-dai-a', 'https://cinestar.com.vn/_next/image/?url=https%3A%2F%2Fapi-website.cinestar.com.vn%2Fmedia%2FMageINIC%2Fbannerslider%2FCTEN.jpg&w=1920&q=75', 'Ưu đãi giá vé 45K cho suất chiếu trước 10h00 và 49K cho suất chiếu sau 22h00\r\n\r\n', '2025-11-29', '2026-02-28', '[\r\n    \"Giá vé ưu đãi 45.000đ/ vé 2D: tất cả các suất chiếu trước 10h00;\",\r\n    \"Giá vé ưu đãi 49.000đ/ vé 2D: tất cả các suất chiếu sau 22h00;\",\r\n    \"Giá vé ưu đãi 55.000đ/ vé 3D: tất cả các suất chiếu trước 10h00 và sau 22h00;\",\r\n    \"Giá vé ưu đãi 95.000đ/ C’MÊ (giường nằm): tất cả các suất chiếu trước 10h00 áp dụng vào thứ 3, 4, 5 tại Cinestar Quốc Thanh, Cinestar Hai Bà Trưng, Cinestar Satra Quận 6;\",\r\n    \"Giá vé ưu đãi 99.000đ/ C’MÊ (giường nằm) tất cả các suất chiếu sau 22h00 áp dụng vào thứ 3, 4, 5 tại Cinestar Quốc Thanh, Cinestar Hai Bà Trưng, Cinestar Satra Quận 6\"\r\n]', '[\r\n    \"Khách hàng có thể mua trực tiếp tại rạp, app/web Cinestar hoặc bất kỳ nền tảng đặt vé online khác.\",\r\n    \"Không áp dụng cho các ngày Lễ / Tết.\"\r\n]', 1, '2025-12-02 22:20:18', '2025-12-02 22:20:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `cinema_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int(11) DEFAULT NULL COMMENT 'Total seats',
  `screen_type` enum('Standard','Deluxe','Couple','IMAX','4DX') DEFAULT 'Standard',
  `layout_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON config for seat layout' CHECK (json_valid(`layout_config`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `rooms`
--

INSERT INTO `rooms` (`id`, `cinema_id`, `name`, `capacity`, `screen_type`, `layout_config`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Phòng 1 - Standard', 185, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":12,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[8,7,6,5,4,3],\"F\":[11,10,9,8,7,6],\"G\":[11,10,9,8,7,6],\"H\":[11,10,9,8,7,6],\"I\":[11,10,9,8,7,6],\"J\":[11,10,9,8,7,6]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\",\"I\",\"J\"]}', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(2, 1, 'Phòng 2 - Nhỏ', 84, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\"],\"seatsPerRow\":{\"A\":10,\"B\":10,\"C\":10,\"D\":10,\"E\":12,\"F\":12,\"G\":12,\"H\":8},\"middleSeats\":{\"E\":[7,6,5,4],\"F\":[8,7,6,5],\"G\":[8,7,6,5]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\"]}', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(3, 1, 'Phòng VIP - Lớn', 275, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\",\"O\",\"P\"],\"seatsPerRow\":{\"A\":15,\"B\":15,\"C\":15,\"D\":15,\"E\":18,\"F\":18,\"G\":18,\"H\":18,\"I\":18,\"J\":18,\"K\":18,\"L\":18,\"M\":18,\"N\":18,\"O\":15,\"P\":10},\"middleSeats\":{\"E\":[12,11,10,9,8,7],\"F\":[13,12,11,10,9,8],\"G\":[13,12,11,10,9,8],\"H\":[13,12,11,10,9,8],\"I\":[13,12,11,10,9,8],\"J\":[13,12,11,10,9,8]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\",\"I\",\"J\"]}', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(4, 1, 'Phòng Mini', 34, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\"],\"seatsPerRow\":{\"A\":6,\"B\":6,\"C\":8,\"D\":8,\"E\":6},\"middleSeats\":{},\"rowsWithMiddleSeats\":[]}', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(5, 1, 'Phòng IMAX', 390, 'IMAX', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\",\"O\",\"P\",\"Q\",\"R\"],\"seatsPerRow\":{\"A\":20,\"B\":20,\"C\":20,\"D\":20,\"E\":22,\"F\":22,\"G\":22,\"H\":22,\"I\":22,\"J\":22,\"K\":22,\"L\":22,\"M\":22,\"N\":22,\"O\":22,\"P\":22,\"Q\":20,\"R\":18},\"middleSeats\":{\"E\":[14,13,12,11,10,9,8,7],\"F\":[15,14,13,12,11,10,9,8],\"G\":[15,14,13,12,11,10,9,8],\"H\":[15,14,13,12,11,10,9,8],\"I\":[15,14,13,12,11,10,9,8],\"J\":[15,14,13,12,11,10,9,8]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\",\"I\",\"J\"]}', 1, '2025-12-02 10:35:42', '2025-12-02 10:35:42'),
(6, 2, 'Phòng 1', 100, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-02 10:35:42', '2025-12-05 02:47:18'),
(7, 2, 'Phòng 2', 100, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-02 10:35:42', '2025-12-05 02:47:18'),
(8, 3, 'Phòng SV1', 120, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:32:38', '2025-12-05 02:47:18'),
(9, 3, 'Phòng SV2', 90, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:32:38', '2025-12-05 02:47:18'),
(10, 4, 'Phòng Huế Lớn', 180, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:32:49', '2025-12-05 02:47:18'),
(11, 4, 'Phòng Huế Nhỏ', 80, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:32:49', '2025-12-05 02:47:18'),
(12, 5, 'Phòng Đà Lạt 1', 200, 'IMAX', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:34', '2025-12-05 02:47:18'),
(13, 5, 'Phòng Đà Lạt 2', 120, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:34', '2025-12-05 02:47:18'),
(14, 5, 'Phòng C\'MÊ', 50, 'Couple', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:34', '2025-12-05 02:47:18'),
(15, 6, 'Phòng LĐ 1', 150, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:47', '2025-12-05 02:47:18'),
(16, 6, 'Phòng LĐ 2', 150, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:47', '2025-12-05 02:47:18'),
(17, 7, 'Phòng MT A', 100, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:55', '2025-12-05 02:47:18'),
(18, 7, 'Phòng MT B', 100, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:33:55', '2025-12-05 02:47:18'),
(19, 8, 'Phòng KG 1', 130, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:34:03', '2025-12-05 02:47:18'),
(20, 8, 'Phòng KG 2', 130, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:34:03', '2025-12-05 02:47:18'),
(21, 9, 'Phòng Satra A', 180, 'Standard', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:34:23', '2025-12-05 02:47:18'),
(22, 9, 'Phòng Satra B', 70, 'Deluxe', '{\"rowLetters\":[\"A\",\"B\",\"C\",\"D\",\"E\",\"F\",\"G\",\"H\",\"I\",\"J\",\"K\",\"L\",\"M\",\"N\"],\"seatsPerRow\":{\"A\":12,\"B\":12,\"C\":12,\"D\":12,\"E\":15,\"F\":15,\"G\":15,\"H\":15,\"I\":15,\"J\":15,\"K\":15,\"L\":15,\"M\":10,\"N\":5},\"middleSeats\":{\"E\":[7,8,9],\"F\":[7,8,9],\"G\":[7,8,9],\"H\":[7,8,9]},\"rowsWithMiddleSeats\":[\"E\",\"F\",\"G\",\"H\"]}', 1, '2025-12-04 05:34:23', '2025-12-05 02:47:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `showtimes`
--

DROP TABLE IF EXISTS `showtimes`;
CREATE TABLE `showtimes` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `movie_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `price` decimal(10,2) NOT NULL COMMENT 'Base ticket price',
  `status` enum('active','cancelled','completed') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `showtimes`
--

INSERT INTO `showtimes` (`id`, `movie_id`, `room_id`, `start_time`, `end_time`, `price`, `status`) VALUES
(1, 1, 1, '2025-12-02 19:00:00', '2025-12-02 20:20:00', 85000.00, 'active'),
(2, 2, 2, '2025-12-02 20:00:00', '2025-12-02 21:52:00', 75000.00, 'active'),
(3, 3, 3, '2025-12-02 21:30:00', '2025-12-02 23:09:00', 95000.00, 'active'),
(4, 1, 1, '2025-12-03 14:00:00', '2025-12-03 15:20:00', 75000.00, 'active'),
(5, 2, 2, '2025-12-03 16:00:00', '2025-12-03 17:52:00', 75000.00, 'active'),
(6, 4, 3, '2025-12-03 18:00:00', '2025-12-03 19:50:00', 85000.00, 'active'),
(7, 3, 4, '2025-12-04 10:00:00', '2025-12-04 11:39:00', 70000.00, 'active'),
(8, 9, 5, '2025-12-04 15:00:00', '2025-12-04 16:42:00', 95000.00, 'active'),
(9, 16, 2, '2025-12-03 22:41:08', '2026-01-01 22:41:08', 45000.00, 'active'),
(10, 16, 6, '2025-12-05 15:30:00', '2025-12-05 17:13:00', 75000.00, 'active'),
(11, 20, 7, '2025-12-05 18:00:00', '2025-12-05 19:57:00', 80000.00, 'active'),
(12, 10, 8, '2025-12-05 17:00:00', '2025-12-05 18:57:00', 65000.00, 'active'),
(13, 19, 9, '2025-12-05 20:30:00', '2025-12-05 22:12:00', 70000.00, 'active'),
(14, 17, 10, '2025-12-05 16:30:00', '2025-12-05 18:07:00', 70000.00, 'active'),
(15, 4, 11, '2025-12-05 19:30:00', '2025-12-05 21:20:00', 75000.00, 'active'),
(16, 13, 12, '2025-12-05 14:00:00', '2025-12-05 15:39:00', 90000.00, 'active'),
(17, 18, 13, '2025-12-05 17:00:00', '2025-12-05 19:15:00', 85000.00, 'active'),
(18, 14, 15, '2025-12-06 18:00:00', '2025-12-06 19:16:00', 65000.00, 'active'),
(19, 1, 16, '2025-12-06 20:30:00', '2025-12-06 21:50:00', 60000.00, 'active'),
(20, 2, 17, '2025-12-06 14:30:00', '2025-12-06 16:22:00', 75000.00, 'active'),
(21, 3, 18, '2025-12-06 17:00:00', '2025-12-06 18:39:00', 70000.00, 'active'),
(22, 9, 19, '2025-12-06 19:00:00', '2025-12-06 20:42:00', 75000.00, 'active'),
(23, 16, 20, '2025-12-06 21:00:00', '2025-12-06 22:43:00', 75000.00, 'active'),
(24, 17, 21, '2025-12-07 15:00:00', '2025-12-07 16:37:00', 85000.00, 'active'),
(25, 19, 22, '2025-12-07 18:30:00', '2025-12-07 20:12:00', 90000.00, 'active'),
(26, 19, 10, '2025-12-04 12:22:00', '2026-01-11 07:04:00', 45000.00, 'active'),
(27, 16, 8, '2025-12-04 12:23:00', '2025-12-31 07:06:00', 45000.00, 'active'),
(28, 18, 14, '2025-12-04 00:00:00', '2025-12-04 02:15:00', 65000.00, 'active'),
(29, 18, 14, '2025-12-04 03:00:00', '2025-12-04 05:15:00', 65000.00, 'active'),
(30, 18, 14, '2025-12-04 06:00:00', '2025-12-04 08:15:00', 65000.00, 'active'),
(31, 18, 14, '2025-12-04 09:00:00', '2025-12-04 11:15:00', 65000.00, 'active'),
(32, 18, 14, '2025-12-04 12:00:00', '2025-12-04 14:15:00', 65000.00, 'active'),
(33, 18, 14, '2025-12-04 15:00:00', '2025-12-04 17:15:00', 65000.00, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `loyalty_points` int(11) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `role` enum('customer','admin','staff') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `password_hash`, `full_name`, `date_of_birth`, `gender`, `avatar_url`, `address`, `loyalty_points`, `email_verified`, `phone_verified`, `status`, `role`, `created_at`, `updated_at`, `last_login`) VALUES
(3, '1@a.com', '1', '$2b$10$Ex73JwPb72BWmYY44dImAeOh1QrtCrnefzuW.UrgMQLTZnL61TVcW', '1', '2004-03-31', NULL, NULL, NULL, 0, 0, 0, 'active', 'customer', '2025-12-02 10:35:42', '2025-12-04 06:47:59', '2025-12-04 06:47:59'),
(4, 'admin@a.com', '12', '$2b$10$WuH/ux.s6Ak4fb4vN/1PLe0IudZvqkKpR7I.2vGlWmGYIog44LYo2', 'Huỳnh Trọng Nghĩa', '0000-00-00', NULL, NULL, NULL, 0, 0, 0, 'active', 'admin', '2025-12-04 10:39:13', '2025-12-04 10:39:45', '2025-12-04 10:39:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `refresh_token` varchar(500) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user_sessions`
--

INSERT INTO `user_sessions` (`id`, `user_id`, `token`, `refresh_token`, `device_info`, `ip_address`, `expires_at`, `created_at`) VALUES
(3, 3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImVtYWlsIjoiMUBhLmNvbSIsImlhdCI6MTc2NDgzMDg3OSwiZXhwIjoxNzY1NDM1Njc5fQ.TJt1OtRogTsXKqKlAK22O2F0uQL_Vk-JoHbQM08G1x0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMsImlhdCI6MTc2NDgzMDg3OSwiZXhwIjoxNzY3NDIyODc5fQ.Nht_A4iOYBRRziIcDSkBMm2Wxu-NDaYyt7e6Ki5t27w', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-11 06:47:59', '2025-12-04 06:47:59'),
(4, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AYS5jb20iLCJpYXQiOjE3NjQ4NDQ3NTMsImV4cCI6MTc2NTQ0OTU1M30.3GXKuNhetOjGBwhHPhXCbkPdByIMPN9rn4_Y2SLgKHU', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2NDg0NDc1MywiZXhwIjoxNzY3NDM2NzUzfQ.u4cfQpbhagad_y6-mZogH-c1BXYDwMJWhzN9c4l9YtA', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-11 10:39:13', '2025-12-04 10:39:13'),
(5, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AYS5jb20iLCJpYXQiOjE3NjQ4NDQ3NTksImV4cCI6MTc2NTQ0OTU1OX0.QgPSNI5LN8Fj8_7ohmWuVeoJ7ktP08upU8N2_GK7wD0', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2NDg0NDc1OSwiZXhwIjoxNzY3NDM2NzU5fQ.x5SYme61Bgj46JSHY-8JCDa29nfhkpa8kzOEKQQ7sOk', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-11 10:39:19', '2025-12-04 10:39:19'),
(6, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImVtYWlsIjoiYWRtaW5AYS5jb20iLCJpYXQiOjE3NjQ4NDQ3ODUsImV4cCI6MTc2NTQ0OTU4NX0.kJBRLiI6XfSUfL7AcMHlN2exVh_Tho4K7CI_2jFbUbQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTc2NDg0NDc4NSwiZXhwIjoxNzY3NDM2Nzg1fQ.YL_XVfkniMaWX3_haWsPsyKphjCLS4TK-Z4zql4RCFs', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '::1', '2025-12-11 10:39:45', '2025-12-04 10:39:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_vouchers`
--

DROP TABLE IF EXISTS `user_vouchers`;
CREATE TABLE `user_vouchers` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `user_id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `status` enum('available','used','expired') DEFAULT 'available',
  `used_at` timestamp NULL DEFAULT NULL COMMENT 'Thời điểm sử dụng',
  `booking_id` int(11) DEFAULT NULL COMMENT 'Đơn hàng đã dùng voucher này',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'Hết hạn (có thể khác với voucher.end_date)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL PRIMARY KEY,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `discount_type` enum('fixed','percentage') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `min_order_amount` decimal(10,2) DEFAULT 0.00,
  `max_usage_per_user` int(11) DEFAULT 1,
  `total_quantity` int(11) DEFAULT NULL,
  `used_count` int(11) DEFAULT 0,
  `movie_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (`movie_ids` is null or json_valid(`movie_ids`)),
  `cinema_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (`cinema_ids` is null or json_valid(`cinema_ids`)),
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `v_booking_summary`
--
DROP VIEW IF EXISTS `v_booking_summary`;

CREATE OR REPLACE VIEW `v_booking_summary` AS SELECT `b`.`id` AS `id`, `b`.`booking_code` AS `booking_code`, `b`.`customer_name` AS `customer_name`, `b`.`customer_phone` AS `customer_phone`, `b`.`status` AS `status`, `b`.`payment_status` AS `payment_status`, `b`.`payment_method` AS `payment_method`, `b`.`created_at` AS `created_at`, `st`.`start_time` AS `showtime_start`, `st`.`end_time` AS `showtime_end`, `m`.`title` AS `movie_title`, `m`.`poster_url` AS `movie_poster`, `c`.`name` AS `cinema_name`, `r`.`name` AS `room_name`, group_concat(distinct `bs`.`seat_code` order by `bs`.`seat_code` ASC separator ', ') AS `seats`, count(distinct `bs`.`id`) AS `total_seats`, `b`.`original_price` AS `original_price`, `b`.`discount_amount` AS `discount_amount`, `b`.`total_price` AS `total_price` FROM (((((`bookings` `b` join `showtimes` `st` on(`b`.`showtime_id` = `st`.`id`)) join `movies` `m` on(`st`.`movie_id` = `m`.`id`)) left join `rooms` `r` on(`st`.`room_id` = `r`.`id`)) left join `cinemas` `c` on(`r`.`cinema_id` = `c`.`id`)) left join `booking_seats` `bs` on(`b`.`id` = `bs`.`booking_id`)) GROUP BY `b`.`id`, `st`.`id`, `m`.`id`, `c`.`id`, `r`.`id` ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD UNIQUE KEY `unique_seat` (`showtime_id`,`seat_row`,`seat_col`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_booking_code` (`booking_code`);

--
-- Chỉ mục cho bảng `booking_products`
--
ALTER TABLE `booking_products`
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Chỉ mục cho bảng `booking_seats`
--
ALTER TABLE `booking_seats`
  ADD UNIQUE KEY `unique_seat_per_booking` (`booking_id`,`seat_row`,`seat_col`),
  ADD KEY `idx_booking_id` (`booking_id`),
  ADD KEY `idx_seat_code` (`seat_code`);

--
-- Chỉ mục cho bảng `booking_vouchers`
--
ALTER TABLE `booking_vouchers`
  ADD KEY `voucher_id` (`voucher_id`),
  ADD KEY `promotion_id` (`promotion_id`),
  ADD KEY `user_voucher_id` (`user_voucher_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `cinemas`
--
-- PRIMARY KEY already defined in CREATE TABLE

--
-- Chỉ mục cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Chỉ mục cho bảng `movies`
--
ALTER TABLE `movies`
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_release_date` (`release_date`),
  ADD KEY `idx_status_release` (`status`,`release_date`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_type_active` (`type`,`is_active`),
  ADD KEY `idx_featured` (`is_featured`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_active` (`is_active`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Chỉ mục cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD KEY `idx_cinema_id` (`cinema_id`),
  ADD KEY `idx_active` (`is_active`);

--
-- Chỉ mục cho bảng `showtimes`
--
ALTER TABLE `showtimes`
  ADD KEY `idx_movie_id` (`movie_id`),
  ADD KEY `idx_room_id` (`room_id`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_movie_start` (`movie_id`,`start_time`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_role` (`role`);

--
-- Chỉ mục cho bảng `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token` (`token`(255));

--
-- Chỉ mục cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_voucher_id` (`voucher_id`),
  ADD KEY `idx_status` (`status`);

--
-- Chỉ mục cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_code` (`code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_products`
--
ALTER TABLE `booking_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `booking_seats`
--
ALTER TABLE `booking_seats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `booking_vouchers`
--
ALTER TABLE `booking_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `cinemas`
--
ALTER TABLE `cinemas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `movies`
--
ALTER TABLE `movies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `showtimes`
--
ALTER TABLE `showtimes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `booking_products`
--
ALTER TABLE `booking_products`
  ADD CONSTRAINT `fk_booking_products_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_booking_products_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Các ràng buộc cho bảng `booking_seats`
--
ALTER TABLE `booking_seats`
  ADD CONSTRAINT `fk_booking_seats_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `booking_vouchers`
--
ALTER TABLE `booking_vouchers`
  ADD CONSTRAINT `booking_vouchers_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_vouchers_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `booking_vouchers_ibfk_3` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `booking_vouchers_ibfk_4` FOREIGN KEY (`user_voucher_id`) REFERENCES `user_vouchers` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `loyalty_transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loyalty_transactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `fk_rooms_cinema` FOREIGN KEY (`cinema_id`) REFERENCES `cinemas` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `showtimes`
--
ALTER TABLE `showtimes`
  ADD CONSTRAINT `fk_showtimes_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_showtimes_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `fk_user_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_vouchers`
--
ALTER TABLE `user_vouchers`
  ADD CONSTRAINT `user_vouchers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_vouchers_ibfk_2` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_vouchers_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;
-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
