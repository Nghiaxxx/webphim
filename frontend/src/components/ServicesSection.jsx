import React from 'react';

const ServicesSection = ({ services = [] }) => {
  if (services.length === 0) return null;

  return (
    <section className="section-block dark-block">
      <div className="section-header">
        <h2>Dịch vụ giải trí khác</h2>
      </div>
      <p className="section-intro">
        WebPhim không chỉ chiếu phim – chúng tôi còn mang đến nhiều mô hình giải trí đặc sắc khác, giúp bạn tận hưởng từng giây phút bên ngoài màn ảnh rộng.
      </p>
      <div className="services-grid-container">
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <img src={service.image} alt={service.title} />
              <div className="service-title">{service.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
