const ChatMessage = require('../models/ChatMessage');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Comprehensive knowledge base for intelligent responses
const knowledgeBase = {
  greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste', 'hola'],
  productQueries: ['product', 'filter', 'purifier', 'price', 'cost', 'buy', 'purchase', 'available', 'stock', 'model'],
  orderQueries: ['order', 'track', 'delivery', 'shipping', 'status', 'when', 'arrive', 'dispatch'],
  paymentQueries: ['payment', 'pay', 'cod', 'online', 'upi', 'card', 'razorpay', 'emi'],
  supportQueries: ['help', 'support', 'problem', 'issue', 'complaint', 'not working'],
  installationQueries: ['install', 'setup', 'how to', 'guide', 'manual', 'technician'],
  warrantyQueries: ['warranty', 'guarantee', 'service', 'maintenance', 'repair', 'amc'],
  serviceQueries: ['service', 'booking', 'appointment', 'visit', 'repair'],
  callQueries: ['call', 'talk', 'speak', 'contact', 'phone', 'representative', 'agent', 'human'],
  discountQueries: ['discount', 'offer', 'deal', 'sale', 'coupon', 'promo'],
  comparisonQueries: ['compare', 'difference', 'vs', 'better', 'which']
};

// Intelligent response generator
const generateResponse = async (userMessage, sessionData = {}) => {
  const message = userMessage.toLowerCase().trim();
  
  // Greeting responses
  if (knowledgeBase.greetings.some(greeting => message.includes(greeting))) {
    const userName = sessionData.userName ? `, ${sessionData.userName}` : '';
    return {
      response: `Hello${userName}! 👋 Welcome to **Arroh Water Filters**\n\nI'm your AI shopping assistant, here to help you 24/7!\n\n**What I can do for you:**\n\n🛒 **Shopping**\n• Browse products & compare\n• Get recommendations\n• Check prices & offers\n\n📦 **Orders & Delivery**\n• Track your orders\n• Check delivery status\n• Manage returns\n\n💳 **Payments**\n• Payment options (COD, UPI, Cards)\n• EMI plans\n• Transaction help\n\n🔧 **Services**\n• Book installation\n• Schedule maintenance\n• Warranty support\n\n📞 **Support**\n• Technical help\n• Request callback\n\n**Try asking:**\n• "Show me RO water purifiers"\n• "Track my order"\n• "What payment options available?"\n• "Book a service"\n\nHow can I assist you today?`,
      type: 'greeting',
      showQuickActions: true
    };
  }

  // Product queries
  if (knowledgeBase.productQueries.some(keyword => message.includes(keyword))) {
    try {
      const products = await Product.find({ isActive: true }).limit(5);
      
      if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
        const productList = products.slice(0, 5).map((p, i) => 
          `${i + 1}. **${p.name}**\n   💰 ₹${p.price.toLocaleString('en-IN')} ${p.discount > 0 ? `(${p.discount}% OFF)` : ''}\n   ⭐ ${p.rating || 4.5}/5 | ${p.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}`
        ).join('\n\n');
        
        return {
          response: `Here are our water purifiers with prices:\n\n${productList}\n\n**All products include:**\n✓ Free installation\n✓ 1-year warranty\n✓ 24/7 customer support\n✓ Easy EMI options\n✓ Free delivery on orders above ₹10,000\n\n💡 **Tip:** Click on any product to view full details!`,
          type: 'product_price_list',
          products: products.slice(0, 5),
          showQuickActions: true
        };
      }
      
      if (message.includes('recommend') || message.includes('best') || message.includes('suggest')) {
        return {
          response: `Based on customer reviews and performance, I recommend:\n\n🌟 **${products[0]?.name || 'Premium RO Water Purifier'}**\n• Price: ₹${products[0]?.price?.toLocaleString('en-IN') || '12,999'}\n• Rating: ${products[0]?.rating || '4.5'}/5\n• Features: ${products[0]?.description?.substring(0, 100) || 'Advanced filtration, UV protection, TDS controller'}\n\nThis is our best-selling product with excellent customer satisfaction!\n\nWould you like to:\n1. View more details\n2. See other options\n3. Place an order`,
          type: 'recommendation',
          products: [products[0]]
        };
      }

      return {
        response: `We have ${products.length}+ water purifiers available! Our range includes:\n\n• RO Water Purifiers\n• UV Water Purifiers\n• Gravity-based Filters\n• Under-sink Systems\n\nAll products feature:\n✓ Advanced filtration technology\n✓ Energy efficient\n✓ Easy maintenance\n✓ Affordable pricing\n\nWhat type of water filter are you looking for?`,
        type: 'product_catalog',
        products: products.slice(0, 3)
      };
    } catch (error) {
      console.error('Product query error:', error);
    }
  }

  // Order tracking queries
  if (knowledgeBase.orderQueries.some(keyword => message.includes(keyword))) {
    if (sessionData.userId) {
      try {
        const recentOrder = await Order.findOne({ user: sessionData.userId })
          .sort({ createdAt: -1 })
          .populate('orderItems.product', 'name');
        
        if (recentOrder) {
          const statusEmoji = {
            'pending': '⏳',
            'confirmed': '✅',
            'processing': '📦',
            'shipped': '🚚',
            'delivered': '✓'
          };
          
          return {
            response: `📦 **Your Recent Order Status**\n\nOrder #${recentOrder.orderNumber}\n${statusEmoji[recentOrder.orderStatus]} Status: ${recentOrder.orderStatus.toUpperCase()}\n\nItems: ${recentOrder.orderItems.map(item => item.name).join(', ')}\nTotal: ₹${recentOrder.totalPrice.toLocaleString('en-IN')}\n\n${recentOrder.trackingNumber ? `Tracking: ${recentOrder.trackingNumber}\n` : ''}${recentOrder.expectedDeliveryDate ? `Expected Delivery: ${new Date(recentOrder.expectedDeliveryDate).toLocaleDateString('en-IN')}\n` : ''}\nNeed help with this order?`,
            type: 'order_status',
            order: recentOrder
          };
        }
      } catch (error) {
        console.error('Order query error:', error);
      }
    }
    
    return {
      response: "To track your order, please:\n\n1. Log in to your account\n2. Go to 'My Orders' section\n3. Click on the order you want to track\n\nOr provide your order number, and I'll help you track it!\n\nTypical delivery time: 3-7 business days\nFree shipping on orders above ₹10,000",
      type: 'order_info'
    };
  }

  // Payment queries
  if (knowledgeBase.paymentQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "💳 **Payment Options Available:**\n\n✓ Cash on Delivery (COD)\n✓ Credit/Debit Cards\n✓ UPI (Google Pay, PhonePe, Paytm)\n✓ Net Banking\n✓ Razorpay Gateway\n\n**Safe & Secure Payments**\n• 256-bit SSL encryption\n• PCI DSS compliant\n• Instant payment confirmation\n\n**EMI Options Available**\n• 3, 6, 9, 12 months EMI\n• Zero processing fee\n• No hidden charges\n\nWhich payment method would you prefer?",
      type: 'payment_info'
    };
  }

  // Installation queries
  if (knowledgeBase.installationQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "🔧 **Free Installation Service**\n\n**What's Included:**\n✓ Professional installation by certified technicians\n✓ Complete setup and testing\n✓ Water quality check\n✓ Usage demonstration\n✓ Maintenance tips\n\n**Installation Process:**\n1. Schedule appointment after delivery\n2. Technician visits within 24-48 hours\n3. Installation takes 1-2 hours\n4. Quality testing and demonstration\n\n**Requirements:**\n• Power socket near installation point\n• Water supply connection\n• Drainage facility\n\nWould you like to schedule an installation?",
      type: 'installation_info'
    };
  }

  // Warranty queries
  if (knowledgeBase.warrantyQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "🛡️ **Warranty & Service**\n\n**Standard Warranty:**\n• 1 year comprehensive warranty\n• Covers manufacturing defects\n• Free parts replacement\n• Free service visits\n\n**Extended Warranty:**\n• Available up to 5 years\n• Annual maintenance contract\n• Priority service\n• Discounted spare parts\n\n**Service Support:**\n• 24/7 helpline: 1800-XXX-XXXX\n• Online service booking\n• Doorstep service\n• 48-hour response time\n\n**Regular Maintenance:**\n• Filter replacement every 6-12 months\n• Free first service\n• Service reminders via SMS/Email\n\nNeed to register your product or book a service?",
      type: 'warranty_info'
    };
  }

  // Support queries - Enhanced with return detection
  if (knowledgeBase.supportQueries.some(keyword => message.includes(keyword))) {
    // Check if user is asking about returns/refunds
    const isReturnQuery = message.includes('return') || message.includes('refund') || 
                         message.includes('defective') || message.includes('damaged') ||
                         message.includes('wrong') || message.includes('not working');
    
    if (isReturnQuery && sessionData.userId) {
      try {
        // Find delivered orders that can be returned (within 7 days)
        const eligibleOrders = await Order.find({ 
          user: sessionData.userId,
          orderStatus: 'delivered',
          returnRequested: false
        }).sort({ deliveredAt: -1 });
        
        const returnableOrders = eligibleOrders.filter(order => order.canBeReturned());
        
        if (returnableOrders.length > 0) {
          const ordersList = returnableOrders.map(order => {
            const daysLeft = order.getDaysRemainingForReturn();
            return `📦 Order #${order.orderNumber}\n   Delivered: ${new Date(order.deliveredAt || order.updatedAt).toLocaleDateString('en-IN')}\n   ⏰ ${daysLeft} days left to return\n   Amount: ₹${order.totalPrice.toLocaleString('en-IN')}`;
          }).join('\n\n');
          
          return {
            response: `I understand you want to return a product. I'm sorry to hear that! 😔\n\n**Your Eligible Orders for Return:**\n\n${ordersList}\n\n**Our 7-Day Return Policy:**\n✓ Easy returns within 7 days of delivery\n✓ Full refund for defective products\n✓ Free reverse pickup by courier\n✓ Refund within 5-7 business days\n\n**Return Process:**\n1. Select the order you want to return\n2. Choose return reason\n3. We'll schedule free pickup\n4. Product inspection at warehouse\n5. Refund processed\n\nWould you like to initiate a return for any of these orders?`,
            type: 'return_eligible',
            returnableOrders: returnableOrders.map(o => ({
              orderId: o._id,
              orderNumber: o.orderNumber,
              totalPrice: o.totalPrice,
              deliveredAt: o.deliveredAt || o.updatedAt,
              daysRemaining: o.getDaysRemainingForReturn(),
              items: o.orderItems.map(item => item.name).join(', ')
            }))
          };
        } else {
          // Check if user has orders but none eligible
          const recentOrders = await Order.find({ 
            user: sessionData.userId,
            orderStatus: 'delivered'
          }).sort({ deliveredAt: -1 }).limit(1);
          
          if (recentOrders.length > 0) {
            const order = recentOrders[0];
            const deliveredDate = new Date(order.deliveredAt || order.updatedAt);
            const daysSince = Math.floor((Date.now() - deliveredDate) / (1000 * 60 * 60 * 24));
            
            return {
              response: `I checked your orders, but unfortunately:\n\n❌ **No orders eligible for return**\n\nYour most recent order (#${order.orderNumber}) was delivered ${daysSince} days ago.\n\n**Return Policy:**\n• Returns accepted within 7 days of delivery\n• Your return window has expired\n\n**Alternative Options:**\n1. **Warranty Claim** - If product is defective, you can claim warranty\n2. **Service Request** - Book a free service visit\n3. **Technical Support** - Get help troubleshooting\n\nWould you like to:\n• File a warranty claim?\n• Book a service visit?\n• Speak with technical support?`,
              type: 'return_expired'
            };
          }
        }
      } catch (error) {
        console.error('Return query error:', error);
      }
    }
    
    return {
      response: "🆘 **Customer Support**\n\nI'm here to help! Please tell me more about your concern:\n\n**Common Issues:**\n1. Product not working properly\n2. Delivery issues\n3. Payment problems\n4. Return/Refund request\n5. Technical support\n\n**Contact Options:**\n📞 Phone: 1800-XXX-XXXX (24/7)\n📧 Email: support@arrohfilters.com\n💬 Live Chat: Available now\n\n**Return Policy:**\n• 7-day easy returns\n• Full refund on defective products\n• Free pickup service\n\nWhat specific issue are you facing?",
      type: 'support_info'
    };
  }

  // Call request queries
  if (knowledgeBase.callQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "📞 **Request a Call Back**\n\nI'd be happy to connect you with our customer support team!\n\nOur representatives can help you with:\n✓ Product recommendations\n✓ Technical support\n✓ Order assistance\n✓ Installation queries\n✓ Any other concerns\n\n**Our Support Hours:**\n• Monday - Saturday: 9:00 AM - 7:00 PM\n• Sunday: 10:00 AM - 5:00 PM\n\n**Response Time:**\n• Urgent requests: Within 30 minutes\n• Regular requests: Within 2 hours\n\nWould you like to request a call back? Click the 'Request Call' button below to get started!",
      type: 'call_request',
      showCallButton: true
    };
  }

  // Specific product name queries
  if (message.includes('ro') || message.includes('uv') || message.includes('purifier')) {
    try {
      const searchTerm = message.includes('ro') ? 'RO' : message.includes('uv') ? 'UV' : 'purifier';
      const products = await Product.find({ 
        isActive: true,
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') }
        ]
      }).limit(3);

      if (products.length > 0) {
        const productList = products.map((p, i) => 
          `${i + 1}. **${p.name}**\n   Price: ₹${p.price.toLocaleString('en-IN')}\n   Rating: ${p.rating}/5 ⭐\n   ${p.description.substring(0, 80)}...`
        ).join('\n\n');

        return {
          response: `Found ${products.length} ${searchTerm} water purifiers:\n\n${productList}\n\nWould you like more details about any of these products?`,
          type: 'product_search',
          products
        };
      }
    } catch (error) {
      console.error('Product search error:', error);
    }
  }

  // Discount/Offers queries
  if (knowledgeBase.discountQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "🎉 **Current Offers & Deals**\n\n**Active Promotions:**\n\n🔥 **Flash Sale**\n• Up to 30% OFF on selected models\n• Limited time offer\n\n💝 **First Order Discount**\n• Get 15% OFF on your first purchase\n• Use code: **FIRST15**\n\n🎁 **Bundle Offers**\n• Buy 2, Get 10% extra discount\n• Free maintenance kit worth ₹999\n\n💳 **Bank Offers**\n• 10% instant discount on HDFC cards\n• No cost EMI on all cards\n\n🚚 **Free Delivery**\n• On all orders above ₹10,000\n\nWant to browse products with these offers?",
      type: 'offers_info',
      showQuickActions: true
    };
  }

  // EMI specific queries
  if (message.includes('emi')) {
    return {
      response: "💰 **EMI Plans Available:**\n\n**No Cost EMI:**\n• 3 months - ₹0 processing fee\n• 6 months - ₹0 processing fee\n• 9 months - ₹0 processing fee\n\n**Standard EMI:**\n• 12 months - Low interest\n• 18 months - Flexible payment\n• 24 months - Maximum flexibility\n\n**Eligible Cards:**\n✓ HDFC, ICICI, SBI, Axis Bank\n✓ Minimum purchase: ₹5,000\n\n**Example:** For ₹12,000 purchase\n• 6 months: ₹2,000/month\n• 12 months: ₹1,000/month\n\n💡 **Tip:** EMI option appears at checkout!",
      type: 'emi_info',
      showQuickActions: true
    };
  }

  // Service booking queries
  if (knowledgeBase.serviceQueries.some(keyword => message.includes(keyword))) {
    return {
      response: "🔧 **Our Service Options:**\n\n**1. Installation Service** 🔧\n• Professional installation\n• Complete setup & testing\n• FREE with product purchase\n\n**2. Annual Maintenance** 🛠️\n• Regular servicing\n• Filter replacement\n• Starting ₹999/year\n\n**3. Repair Service** 🔨\n• Expert technicians\n• Genuine spare parts\n• 90-day service warranty\n\n**Service Features:**\n✓ Certified technicians\n✓ Same-day service available\n✓ Genuine spare parts\n✓ Service warranty included\n✓ Doorstep service\n\nWould you like to book a service now?",
      type: 'service_info',
      showQuickActions: true
    };
  }

  // Default intelligent response
  return {
    response: "I understand you're asking about: \"" + userMessage + "\"\n\nI'm here to help! I can assist you with:\n\n🔹 **Products** - Browse our water purifiers\n🔹 **Orders** - Track your order status\n🔹 **Payments** - Payment options and EMI\n🔹 **Installation** - Free installation service\n🔹 **Support** - Technical help and service\n🔹 **Warranty** - Product warranty details\n\nCould you please provide more details about what you're looking for?\n\nOr type:\n• 'products' to see our catalog\n• 'track order' to check order status\n• 'help' for customer support\n• 'call me' to request a callback",
    type: 'clarification',
    showQuickActions: true
  };
};

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Public
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Message and session ID are required'
      });
    }

    // Get or create chat session
    let chatSession = await ChatMessage.findOne({ sessionId });
    
    if (!chatSession) {
      chatSession = new ChatMessage({
        sessionId,
        user: req.user?._id || null,
        userEmail: req.user?.email || null,
        userName: req.user?.name || 'Guest',
        messages: []
      });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate bot response
    const sessionData = {
      userId: req.user?._id,
      userName: req.user?.name
    };
    
    const responseData = await generateResponse(message, sessionData);
    const { response, type, products, order, showCallButton, showQuickActions } = responseData;

    // Add bot response
    chatSession.messages.push({
      role: 'bot',
      content: response,
      timestamp: new Date(),
      metadata: {
        type,
        products: products?.map(p => ({ id: p._id, name: p.name, price: p.price })),
        order: order ? { id: order._id, orderNumber: order.orderNumber } : null,
        showCallButton,
        showQuickActions
      }
    });

    await chatSession.save();

    res.status(200).json({
      success: true,
      data: {
        message: response,
        type,
        products,
        order,
        showCallButton,
        showQuickActions,
        sessionId
      }
    });
  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing your message. Please try again.'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chatbot/history/:sessionId
// @access  Public
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const chatSession = await ChatMessage.findOne({ sessionId });
    
    if (!chatSession) {
      return res.status(200).json({
        success: true,
        data: {
          messages: [],
          sessionId
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        messages: chatSession.messages,
        sessionId,
        isResolved: chatSession.isResolved
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
};

// @desc    Rate chat experience
// @route   POST /api/chatbot/rate
// @access  Public
const rateChatExperience = async (req, res) => {
  try {
    const { sessionId, rating, feedback } = req.body;
    
    if (!sessionId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and rating are required'
      });
    }

    const chatSession = await ChatMessage.findOne({ sessionId });
    
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    chatSession.rating = rating;
    chatSession.feedback = feedback;
    chatSession.isResolved = true;
    
    await chatSession.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!'
    });
  } catch (error) {
    console.error('Rate chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating'
    });
  }
};

// @desc    Get all chat sessions (Admin)
// @route   GET /api/chatbot/sessions
// @access  Private/Admin
const getAllChatSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const sessions = await ChatMessage.find()
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email');

    const total = await ChatMessage.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chat sessions'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  rateChatExperience,
  getAllChatSessions
};
