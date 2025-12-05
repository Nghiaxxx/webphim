const Booking = require('../models/Booking');
const { HTTP_STATUS } = require('../config/constants');

class RevenueController {
  static async getRevenue(req, res, next) {
    try {
      const { date_from, date_to } = req.query;
      
      // Build date filter
      let dateFilter = '';
      const params = [];
      
      if (date_from && date_to) {
        dateFilter = ' AND DATE(created_at) BETWEEN ? AND ?';
        params.push(date_from, date_to);
      } else if (date_from) {
        dateFilter = ' AND DATE(created_at) >= ?';
        params.push(date_from);
      } else if (date_to) {
        dateFilter = ' AND DATE(created_at) <= ?';
        params.push(date_to);
      }

      // Get all bookings with filters
      const sql = `
        SELECT 
          id,
          total_price,
          original_price,
          discount_amount,
          payment_status,
          status,
          created_at
        FROM bookings
        WHERE payment_status = 'paid' AND status != 'cancelled'
        ${dateFilter}
        ORDER BY created_at DESC
      `;

      const db = require('../lib/db');
      
      db.query(sql, params, (err, bookings) => {
        if (err) {
          return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
            error: 'Lỗi khi lấy dữ liệu doanh thu' 
          });
        }

        // Calculate statistics
        const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
        const totalOriginalPrice = bookings.reduce((sum, b) => sum + parseFloat(b.original_price || 0), 0);
        const totalDiscount = bookings.reduce((sum, b) => sum + parseFloat(b.discount_amount || 0), 0);
        const totalBookings = bookings.length;

        // Calculate by period
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(today);
        thisWeek.setDate(today.getDate() - today.getDay());
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const dailyRevenue = bookings
          .filter(b => new Date(b.created_at) >= today)
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        const weeklyRevenue = bookings
          .filter(b => new Date(b.created_at) >= thisWeek)
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        const monthlyRevenue = bookings
          .filter(b => new Date(b.created_at) >= thisMonth)
          .reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

        // Monthly breakdown for chart
        const monthlyBreakdown = {};
        bookings.forEach(booking => {
          const month = new Date(booking.created_at).toISOString().substring(0, 7); // YYYY-MM
          if (!monthlyBreakdown[month]) {
            monthlyBreakdown[month] = 0;
          }
          monthlyBreakdown[month] += parseFloat(booking.total_price || 0);
        });

        const monthlyChart = Object.keys(monthlyBreakdown)
          .sort()
          .map(month => ({
            month,
            revenue: monthlyBreakdown[month]
          }));

        res.status(HTTP_STATUS.OK).json({
          total_revenue: totalRevenue,
          total_original_price: totalOriginalPrice,
          total_discount: totalDiscount,
          total_bookings: totalBookings,
          daily_revenue: dailyRevenue,
          weekly_revenue: weeklyRevenue,
          monthly_revenue: monthlyRevenue,
          average_ticket_price: totalBookings > 0 ? totalRevenue / totalBookings : 0,
          monthly_chart: monthlyChart
        });
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RevenueController;

