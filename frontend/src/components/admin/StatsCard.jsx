import '../../styles/admin/StatsCard.css';

const StatsCard = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  return (
    <div className={`stats-card stats-${color}`}>
      <div className="stats-content">
        <div className="stats-info">
          <h3 className="stats-title">{title}</h3>
          <p className="stats-value">{value}</p>
          {trend && (
            <div className={`stats-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
              <span className="trend-icon">
                <i className={`fa-solid ${trend === 'up' ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
              </span>
              <span className="trend-value">{trendValue}</span>
              <span className="trend-text">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className="stats-icon">
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

