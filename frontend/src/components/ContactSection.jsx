import React from 'react';

const ContactSection = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý submit form ở đây
  };

  return (
    <section className="section-block contact-block">
      <div className="contact-left">
        <h2>LIÊN HỆ VỚI CHÚNG TÔI</h2>
        <div className="contact-buttons">
          <button className="contact-social-btn facebook">FACEBOOK</button>
          <button className="contact-social-btn zalo">ZALO CHAT</button>
        </div>
      </div>
      <div className="contact-right">
        <h3>THÔNG TIN LIÊN HỆ</h3>
        <div className="contact-info-header">
          <p>
            <img src="https://cinestar.com.vn/assets/images/ct-1.svg" alt="" /> 
            cs@cinestar.com.vn
          </p>
          <p>
            <img src="https://cinestar.com.vn/assets/images/ct-2.svg" alt="" /> 
            1900 0085
          </p>
          <p>
            <img src="https://cinestar.com.vn/assets/images/ct-3.svg" alt="" /> 
            135 Hai Bà Trưng, phường Sài Gòn, TP.HCM
          </p>
        </div>
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <input type="text" placeholder="Họ và tên" required />
          <input type="email" placeholder="Điền email" required />
          <textarea rows="4" placeholder="Thông tin liên hệ hoặc phản ánh" required></textarea>
          
          <button className="contact-submit-btn" type="submit">
            GỬI NGAY
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
