import React from 'react';

const MemberProgram = () => {
  const memberPrograms = [
    {
      id: 1,
      title: "THÀNH VIÊN C'FRIEND",
      description: "The C'Friend mang đến nhiều ưu đãi cho thành viên mới",
      image: "https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Member/Desktop519x282_CMember.webp",
      alt: "C'FRIEND"
    },
    {
      id: 2,
      title: "THÀNH VIÊN C'VIP",
      description: "Thẻ VIP Cinestar dành riêng cho bạn những đặc quyền chất riêng.",
      image: "https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Member/c-vip.webp",
      alt: "C'VIP"
    }
  ];

  return (
    <section className="member-program-section">
      <div className="member-program-container">
        <div className="section-header">
          <h2>CHƯƠNG TRÌNH THÀNH VIÊN</h2>
        </div>
        <div className="member-cards-wrapper">
          {memberPrograms.map((program) => (
            <div key={program.id} className="member-card">
              <div className="member-card-image">
                <img src={program.image} alt={program.alt} />
              </div>
              <div className="member-card-content">
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <button className="cssbuttons-io"><span>TÌM HIỂU NGAY</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MemberProgram;
