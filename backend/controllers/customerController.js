const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Get all customers with their statistics
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  try {
    console.log('Fetching all customers with statistics...');
    
    // Get all customers (users with role 'customer')
    const customers = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${customers.length} customers`);
    
    // Get statistics for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        // Get all orders for this customer
        const orders = await Order.find({ user: customer._id })
          .sort({ createdAt: -1 });
        
        // Calculate statistics - only count revenue when money is received
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => {
          const orderTotal = order.totalPrice || order.totalAmount || 0;
          const status = order.status || order.orderStatus;
          const isCOD = ['cash_on_delivery', 'cod', 'COD'].includes(order.paymentMethod);
          
          // Only count if:
          // 1. Razorpay and isPaid=true (payment received online)
          // 2. COD and delivered (cash received from customer)
          const shouldCount = order.isPaid || (isCOD && status === 'delivered');
          
          return shouldCount ? sum + orderTotal : sum;
        }, 0);
        
        const pendingOrders = orders.filter(o => {
          const status = o.status || o.orderStatus;
          return status === 'pending' || status === 'processing';
        }).length;
        
        const completedOrders = orders.filter(o => {
          const status = o.status || o.orderStatus;
          return status === 'delivered';
        }).length;
        
        // Determine customer status
        let customerStatus = 'New';
        if (totalOrders > 10) customerStatus = 'VIP';
        else if (totalOrders > 5) customerStatus = 'Regular';
        else if (totalOrders > 0) customerStatus = 'Active';
        
        // Get last order date
        const lastOrder = orders.length > 0 ? orders[0] : null;
        
        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          joinedDate: customer.createdAt,
          totalOrders,
          totalSpent,
          pendingOrders,
          completedOrders,
          status: customerStatus,
          lastOrderDate: lastOrder ? lastOrder.createdAt : null,
          lastOrderId: lastOrder ? lastOrder._id : null
        };
      })
    );
    
    // Calculate overall statistics
    const stats = {
      totalCustomers: customersWithStats.length,
      activeCustomers: customersWithStats.filter(c => c.status === 'Active' || c.status === 'Regular' || c.status === 'VIP').length,
      newCustomers: customersWithStats.filter(c => c.status === 'New').length,
      vipCustomers: customersWithStats.filter(c => c.status === 'VIP').length,
      totalRevenue: customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0) / 
                        customersWithStats.reduce((sum, c) => sum + c.totalOrders, 0) || 0
    };
    
    console.log('Customer statistics calculated:', stats);
    
    res.status(200).json({
      success: true,
      data: {
        customers: customersWithStats,
        stats
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single customer details with full order history
// @route   GET /api/customers/:id
// @access  Private/Admin
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.id;
    
    // Get customer details
    const customer = await User.findById(customerId).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Get all orders for this customer
    const orders = await Order.find({ user: customerId })
      .populate('orderItems.product', 'name images category')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => {
      return sum + (order.totalPrice || order.totalAmount || 0);
    }, 0);
    
    const stats = {
      totalOrders: orders.length,
      totalSpent,
      averageOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
      pendingOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        return status === 'pending' || status === 'processing';
      }).length,
      completedOrders: orders.filter(o => {
        const status = o.status || o.orderStatus;
        return status === 'delivered';
      }).length
    };
    
    res.status(200).json({
      success: true,
      data: {
        customer,
        orders,
        stats
      }
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customer details'
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerById
};
