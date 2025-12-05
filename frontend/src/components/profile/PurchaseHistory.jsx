import React from 'react';

const PurchaseHistory = ({ onViewTicket }) => {
  // Sample data - replace with actual data from API later
  const historyData = [
    {
      orderId: '139463699',
      activity: 'Mua vé',
      branch: 'Hai Bà Trưng',
      date: '21/09/2025',
      total: '98,000 ₫',
      points: '98 Điểm'
    }
  ];

  return (
    <>
      <h1 className="purchase-history-title">LỊCH SỬ MUA HÀNG</h1>
      <div className="purchase-history-container">
        <table className="purchase-history-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Hoạt động</th>
              <th>Chi nhánh</th>
              <th>Ngày</th>
              <th>Tổng cộng</th>
              <th>Điểm</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((item) => (
              <tr key={item.orderId}>
                <td>{item.orderId}</td>
                <td>{item.activity}</td>
                <td>{item.branch}</td>
                <td>{item.date}</td>
                <td>{item.total}</td>
                <td>{item.points}</td>
                <td>
                  <a 
                    href="#" 
                    className="view-ticket-link"
                    onClick={(e) => {
                      e.preventDefault();
                      onViewTicket(item.orderId);
                    }}
                  >
                    Xem vé
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PurchaseHistory;

