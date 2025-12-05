import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  
  return (
    <footer className="site-footer">
        <div className="footer-inner-content">
            
            {/* Cột 1: Logo và Nút */}
            <div className="footer-col footer-info">
                <div className="footer-logo">
                    <span><img src="https://cinestar.com.vn/_next/image/?url=%2Fassets%2Fimages%2Fheader-logo.png&w=1920&q=75" alt="" /></span>
                    
                    
                </div>
                <p className="slogan">BE HAPPY, BE A STAR</p>
                <div className="footer-buttons">
                    <button className="btn-footer primary">{t('footer.bookTicket')}</button>
                    <button className="btn-footer secondary">{t('footer.bookSnack')}</button>
                </div>
                <div className="social-links">
                    <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                    <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                    <a href="#" aria-label="TikTok"><i className="fab fa-tiktok"></i></a>
                    <a href="#" aria-label="Zalo"><i className="fab fa-whatsapp"></i></a>
                </div>
                <div className="language-select">
                    <span>{t('footer.language')}</span>
                    <span className="lang-option">
                        <img src="https://cinestar.com.vn/assets/images/footer-vietnam.svg" alt="VN" />
                        <span>{language === 'vi' ? 'VN' : 'ENG'}</span>
                    </span>
                </div>
            </div>

            {/* Cột 2: Tài khoản & Xem Phim */}
            <div className="footer-col">
                <div className="col-group">
                    <h4>TÀI KHOẢN</h4>
                    <ul className="footer-nav">
                        <li><a href="#">Đăng nhập</a></li>
                        <li><a href="#">Đăng ký</a></li>
                        <li><a href="#">Membership</a></li>
                    </ul>
                </div>
                <div className="col-group">
                    <h4>XEM PHIM</h4>
                    <ul className="footer-nav">
                        <li><a href="#">Phim đang chiếu</a></li>
                        <li><a href="#">Phim sắp chiếu</a></li>
                        <li><a href="#">Suất chiếu đặc biệt</a></li>
                    </ul>
                </div>
            </div>

            {/* Cột 3: Thuê Sự kiện & Cinestar */}
            <div className="footer-col">
                <div className="col-group">
                    <h4>THUÊ SỰ KIỆN</h4>
                    <ul className="footer-nav">
                        <li><a href="#">Thuê rạp</a></li>
                        <li><a href="#">Các loại hình cho thuê khác</a></li>
                    </ul>
                </div>
                <div className="col-group">
                    <h4>CINESTAR</h4>
                    <ul className="footer-nav">
                        <li><a href="#">Giới thiệu</a></li>
                        <li><a href="#">Liên hệ</a></li>
                        <li><a href="#">Tuyển dụng</a></li>
                    </ul>
                </div>
            </div>

            {/* Cột 4: Dịch vụ Khác */}
            <div className="footer-col">
                <h4>DỊCH VỤ KHÁC</h4>
                <ul className="footer-nav">
                    <li><a href="#">Nhà hàng</a></li>
                    <li><a href="#">Kidzone</a></li>
                    <li><a href="#">Bowling</a></li>
                    <li><a href="#">Billiards</a></li>
                    <li><a href="#">Gym</a></li>
                    <li><a href="#">Nhà hát Opera</a></li>
                    <li><a href="#">Coffee</a></li>
                </ul>
            </div>
            
            {/* Cột 5: Hệ thống Rạp */}
            <div className="footer-col footer-system">
                <h4>HỆ THỐNG RẠP</h4>
                <ul className="footer-nav">
                    <li><a href="#">Tất cả hệ thống rạp</a></li>
                    <li><a href="#">Cinestar Quốc Thanh (TP.HCM)</a></li>
                    <li><a href="#">Cinestar Hai Bà Trưng (TP.HCM)</a></li>
                    <li><a href="#">Cinestar Sinh Viên (TP.HCM)</a></li>
                    <li><a href="#">Cinestar Huế (TP. Huế)</a></li>
                    <li><a href="#">Cinestar Đà Lạt (Lâm Đồng)</a></li>
                    <li><a href="#">Cinestar Lâm Đồng (Đức Trọng)</a></li>
                    <li><a href="#">Cinestar Mỹ Tho (Đồng Tháp)</a></li>
                    <li><a href="#">Cinestar Kiên Giang (An Giang)</a></li>
                    <li><a href="#">Cinestar Satra Quận 6 (TP.HCM)</a></li>
                </ul>
            </div>

        </div>

        {/* Dải thông tin dưới cùng */}
        <div className="footer-bottom">
            <div className="bottom-inner">
                <p className="copyright">© {currentYear} Cinestar. All rights reserved.</p>
                <div className="bottom-links">
                    <a href="#">Chính sách bảo mật</a>
                    <a href="#">Tin điện ảnh</a>
                    <a href="#">Hỏi và đáp</a>
                </div>
            </div>
            <div className="legal-info-wrapper">
                <div className="bocongthuong-badge">
                    <img src="https://api-website.cinestar.com.vn/media/wysiwyg/bocongthuong/dathongbao.webp" alt="" />
                
                </div>
                <div className="legal-info">
                    <p>CÔNG TY CỔ PHẦN GIẢI TRÍ PHÁT HÀNH PHIM - RẠP CHIẾU PHIM NGÔI SAO</p>
                    <p>ĐỊA CHỈ: 135 HAI BÀ TRƯNG, PHƯỜNG SÀI GÒN, TPHCM</p>
                    <p>GIẤY CNĐKDN SỐ: 0312742744, ĐĂNG KÝ LẦN ĐẦU NGÀY 18/04/2014, ĐĂNG KÝ THAY ĐỔI LẦN THỨ 2 NGÀY 15/09/2014, CẤP BỞI SỞ KH&ĐT TPHCM</p>
                </div>
            </div>
        </div>
    </footer>
  );
};

export default Footer;