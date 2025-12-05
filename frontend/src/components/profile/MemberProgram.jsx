import React from 'react';
import { APP_CONFIG } from '../../constants/app';

const MemberProgram = ({ loyaltyPoints, pointsPercentage }) => {
  return (
    <>
      <h1 className="profile-title">ĐĂNG KÝ THÀNH VIÊN</h1>

      {/* Points Display */}
      <div className="member-points-display">
        <div className="member-points-header">
          <div className="member-points-label">Tích điểm <span>CVIP MEMBER</span></div>
          <div className="member-points-value">
            <span>{loyaltyPoints.toLocaleString()}</span>/10K
          </div>
        </div>
        <div className="member-points-progress-bar">
          <div 
            className="member-points-progress-fill" 
            style={{ width: `${pointsPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Membership Tiers */}
      <div className="member-tiers-container">
        {/* C'FRIEND Card */}
        <div className="member-tier-card cfriend-card">
          <div className="member-tier-header cfriend-header">
            
          </div>
          <div className="member-tier-content">
            <h2 className="member-tier-title">C'FRIEND</h2>
            <p className="member-tier-description">
              Được cấp lần đầu khi mua 2 vé xem phim bất kỳ tại Cinestar.
            </p>
            <div className="member-tier-benefits">
              <h3 className="member-benefits-title">
                ĐƯỢC TÍCH LŨY ĐIỂM THEO GIÁ TRỊ MUA HÀNG HÓA DỊCH VỤ NHƯ SAU:
              </h3>
              <ul className="member-benefits-list">
                <li>Được giảm 10% trực tiếp trên giá trị hóa đơn bắp nước khi mua tại quầy.</li>
                <li>Được tặng 1 vé xem phim 2D vào tuần sinh nhật (tính từ Thứ Hai đến Chủ Nhật) với số điểm tích lũy tối thiểu 500 điểm.</li>
                <li>Được tham gia các chương trình dành cho thành viên.</li>
              </ul>
            </div>
            <button className="member-tier-button cfriend-button-active">
              BẠN ĐÃ LÀ THÀNH VIÊN C'FRIEND
            </button>
          </div>
        </div>

        {/* C'VIP Card */}
        <div className="member-tier-card cvip-card">
          <div className="member-tier-header cvip-header">
            
          </div>
          <div className="member-tier-content">
            <h2 className="member-tier-title">C'VIP</h2>
            <p className="member-tier-description">
              Được cấp cho thành viên C'Friend khi tích lũy được ít nhất 10,000 điểm.
            </p>
            <div className="member-tier-benefits">
              <h3 className="member-benefits-title">
                ĐƯỢC TÍCH LŨY ĐIỂM THEO GIÁ TRỊ MUA HÀNG HÓA DỊCH VỤ NHƯ SAU:
              </h3>
              <ul className="member-benefits-list">
                <li>Được giảm 15% trực tiếp trên giá trị hóa đơn bắp nước khi mua tại quầy.</li>
                <li>Có cơ hội nhận vé tham gia Lễ Ra Mắt Phim và các chương trình khuyến mãi khác của Cinestar.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="member-rewards-section">
        <img src={APP_CONFIG.IMAGES.LOYALTY_PROGRAM} alt="" />
      </div>
    </>
  );
};

export default MemberProgram;

