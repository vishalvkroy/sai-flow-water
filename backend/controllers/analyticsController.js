const Order = require('../models/Order');
const ServiceBooking = require('../models/ServiceBooking');
const User = require('../models/User');

/**
 * Get comprehensive seller analytics with separate product and service earnings
 * @route GET /api/analytics/seller-dashboard
 * @access Private (Seller/Admin)
 */
const getSellerDashboardStats = async (req, res) => {
  try {
    console.log('📊 Fetching seller dashboard analytics...');

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    // ==================== PRODUCT EARNINGS ====================
    
    // Today's product earnings (ONLY PAID ORDERS)
    const todayProductEarnings = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // This month's product earnings (ONLY PAID ORDERS)
    const thisMonthProductEarnings = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: thisMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month's product earnings (ONLY PAID ORDERS)
    const lastMonthProductEarnings = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          paidAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // All-time product earnings (ONLY PAID ORDERS)
    const allTimeProductEarnings = await Order.aggregate([
      {
        $match: {
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending product orders (COD - not yet paid)
    const pendingProductOrders = await Order.aggregate([
      {
        $match: {
          isPaid: false,
          orderStatus: { $nin: ['cancelled', 'returned'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      }
    ]);

    // ==================== SERVICE EARNINGS ====================
    
    // Today's service earnings (ONLY PAID - advance_paid or fully_paid)
    const todayServiceEarnings = await ServiceBooking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['advance_paid', 'fully_paid'] },
          'advancePayment.paidAt': { $gte: today }
        }
      },
      {
        $group: {
          _id: null,
          advanceTotal: { $sum: '$advanceAmount' },
          remainingTotal: { $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'fully_paid'] },
              '$remainingAmount',
              0
            ]
          }},
          count: { $sum: 1 }
        }
      }
    ]);

    // This month's service earnings (ONLY PAID)
    const thisMonthServiceEarnings = await ServiceBooking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['advance_paid', 'fully_paid'] },
          'advancePayment.paidAt': { $gte: thisMonthStart }
        }
      },
      {
        $group: {
          _id: null,
          advanceTotal: { $sum: '$advanceAmount' },
          remainingTotal: { $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'fully_paid'] },
              '$remainingAmount',
              0
            ]
          }},
          count: { $sum: 1 }
        }
      }
    ]);

    // Last month's service earnings (ONLY PAID)
    const lastMonthServiceEarnings = await ServiceBooking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['advance_paid', 'fully_paid'] },
          'advancePayment.paidAt': { $gte: lastMonthStart, $lte: lastMonthEnd }
        }
      },
      {
        $group: {
          _id: null,
          advanceTotal: { $sum: '$advanceAmount' },
          remainingTotal: { $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'fully_paid'] },
              '$remainingAmount',
              0
            ]
          }},
          count: { $sum: 1 }
        }
      }
    ]);

    // All-time service earnings (ONLY PAID)
    const allTimeServiceEarnings = await ServiceBooking.aggregate([
      {
        $match: {
          paymentStatus: { $in: ['advance_paid', 'fully_paid'] }
        }
      },
      {
        $group: {
          _id: null,
          advanceTotal: { $sum: '$advanceAmount' },
          remainingTotal: { $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'fully_paid'] },
              '$remainingAmount',
              0
            ]
          }},
          count: { $sum: 1 }
        }
      }
    ]);

    // Pending service collections (advance paid, remaining to collect)
    const pendingServiceCollections = await ServiceBooking.aggregate([
      {
        $match: {
          paymentStatus: 'advance_paid',
          status: { $in: ['confirmed', 'assigned', 'in_progress'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$remainingAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Cancellation fees earned
    const cancellationFees = await ServiceBooking.aggregate([
      {
        $match: {
          status: 'cancelled',
          paymentStatus: { $in: ['partially_refunded', 'refunded'] },
          'refund.deductedAmount': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$refund.deductedAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // ==================== CALCULATE TOTALS ====================
    
    const productStats = {
      today: {
        revenue: todayProductEarnings[0]?.total || 0,
        orders: todayProductEarnings[0]?.count || 0
      },
      thisMonth: {
        revenue: thisMonthProductEarnings[0]?.total || 0,
        orders: thisMonthProductEarnings[0]?.count || 0
      },
      lastMonth: {
        revenue: lastMonthProductEarnings[0]?.total || 0,
        orders: lastMonthProductEarnings[0]?.count || 0
      },
      allTime: {
        revenue: allTimeProductEarnings[0]?.total || 0,
        orders: allTimeProductEarnings[0]?.count || 0
      },
      pending: {
        revenue: pendingProductOrders[0]?.total || 0,
        orders: pendingProductOrders[0]?.count || 0
      }
    };

    const serviceStats = {
      today: {
        advanceRevenue: todayServiceEarnings[0]?.advanceTotal || 0,
        remainingRevenue: todayServiceEarnings[0]?.remainingTotal || 0,
        totalRevenue: (todayServiceEarnings[0]?.advanceTotal || 0) + (todayServiceEarnings[0]?.remainingTotal || 0),
        bookings: todayServiceEarnings[0]?.count || 0
      },
      thisMonth: {
        advanceRevenue: thisMonthServiceEarnings[0]?.advanceTotal || 0,
        remainingRevenue: thisMonthServiceEarnings[0]?.remainingTotal || 0,
        totalRevenue: (thisMonthServiceEarnings[0]?.advanceTotal || 0) + (thisMonthServiceEarnings[0]?.remainingTotal || 0),
        bookings: thisMonthServiceEarnings[0]?.count || 0
      },
      lastMonth: {
        advanceRevenue: lastMonthServiceEarnings[0]?.advanceTotal || 0,
        remainingRevenue: lastMonthServiceEarnings[0]?.remainingTotal || 0,
        totalRevenue: (lastMonthServiceEarnings[0]?.advanceTotal || 0) + (lastMonthServiceEarnings[0]?.remainingTotal || 0),
        bookings: lastMonthServiceEarnings[0]?.count || 0
      },
      allTime: {
        advanceRevenue: allTimeServiceEarnings[0]?.advanceTotal || 0,
        remainingRevenue: allTimeServiceEarnings[0]?.remainingTotal || 0,
        totalRevenue: (allTimeServiceEarnings[0]?.advanceTotal || 0) + (allTimeServiceEarnings[0]?.remainingTotal || 0),
        bookings: allTimeServiceEarnings[0]?.count || 0
      },
      pendingCollection: {
        amount: pendingServiceCollections[0]?.total || 0,
        bookings: pendingServiceCollections[0]?.count || 0
      },
      cancellationFees: {
        amount: cancellationFees[0]?.total || 0,
        count: cancellationFees[0]?.count || 0
      }
    };

    const totalStats = {
      today: {
        revenue: productStats.today.revenue + serviceStats.today.totalRevenue,
        transactions: productStats.today.orders + serviceStats.today.bookings
      },
      thisMonth: {
        revenue: productStats.thisMonth.revenue + serviceStats.thisMonth.totalRevenue,
        transactions: productStats.thisMonth.orders + serviceStats.thisMonth.bookings
      },
      lastMonth: {
        revenue: productStats.lastMonth.revenue + serviceStats.lastMonth.totalRevenue,
        transactions: productStats.lastMonth.orders + serviceStats.lastMonth.bookings
      },
      allTime: {
        revenue: productStats.allTime.revenue + serviceStats.allTime.totalRevenue + serviceStats.cancellationFees.amount,
        transactions: productStats.allTime.orders + serviceStats.allTime.bookings
      }
    };

    // Calculate growth percentage
    const monthlyGrowth = productStats.lastMonth.revenue > 0
      ? ((productStats.thisMonth.revenue - productStats.lastMonth.revenue) / productStats.lastMonth.revenue * 100).toFixed(2)
      : 100;

    console.log('✅ Analytics calculated successfully');

    res.json({
      success: true,
      data: {
        products: productStats,
        services: serviceStats,
        total: totalStats,
        growth: {
          monthly: parseFloat(monthlyGrowth)
        },
        summary: {
          totalRevenue: totalStats.allTime.revenue,
          productRevenue: productStats.allTime.revenue,
          serviceRevenue: serviceStats.allTime.totalRevenue,
          cancellationFees: serviceStats.cancellationFees.amount,
          pendingCollections: serviceStats.pendingCollection.amount + productStats.pending.revenue
        }
      }
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

/**
 * Get customer dashboard stats (spending overview)
 * @route GET /api/analytics/customer-dashboard
 * @access Private (Customer)
 */
const getCustomerDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Product orders (ONLY PAID)
    const productOrders = await Order.aggregate([
      {
        $match: {
          user: userId,
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Service bookings (ONLY PAID)
    const serviceBookings = await ServiceBooking.aggregate([
      {
        $match: {
          user: userId,
          paymentStatus: { $in: ['advance_paid', 'fully_paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$advanceAmount' },
          remainingSpent: { $sum: { 
            $cond: [
              { $eq: ['$paymentStatus', 'fully_paid'] },
              '$remainingAmount',
              0
            ]
          }},
          bookingCount: { $sum: 1 }
        }
      }
    ]);

    const productSpent = productOrders[0]?.totalSpent || 0;
    const serviceSpent = (serviceBookings[0]?.totalSpent || 0) + (serviceBookings[0]?.remainingSpent || 0);
    const totalSpent = productSpent + serviceSpent;

    res.json({
      success: true,
      data: {
        products: {
          totalSpent: productSpent,
          orderCount: productOrders[0]?.orderCount || 0
        },
        services: {
          totalSpent: serviceSpent,
          bookingCount: serviceBookings[0]?.bookingCount || 0
        },
        total: {
          totalSpent: totalSpent,
          transactionCount: (productOrders[0]?.orderCount || 0) + (serviceBookings[0]?.bookingCount || 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer analytics',
      error: error.message
    });
  }
};

module.exports = {
  getSellerDashboardStats,
  getCustomerDashboardStats
};
