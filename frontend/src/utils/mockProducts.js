// Mock products API for development
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'RO Water Purifier 7L',
    description: 'Advanced RO technology with 7-stage purification process for Aurangabad homes. Removes 99.9% of contaminants including bacteria, viruses, and heavy metals.',
    price: 12999,
    originalPrice: 15999,
    category: 'ro',
    brand: 'Sai Flow Water',
    capacity: '7L',
    features: ['7-stage purification', 'RO + UV + UF', 'Mineralizer', 'TDS Controller', 'Storage Tank'],
    rating: 4.5,
    reviewCount: 128,
    inStock: true,
    stock: 15,
    images: ['/api/placeholder/400/300'],
    featured: true,
    specifications: {
      'Purification Technology': 'RO + UV + UF',
      'Storage Capacity': '7 Liters',
      'Purification Capacity': '15 L/hr',
      'Input Water Temperature': '10°C to 40°C',
      'Operating Voltage': '24V DC',
      'Dimensions': '350 x 320 x 500 mm'
    }
  },
  {
    id: 2,
    name: 'UV Water Filter 10L',
    description: 'UV sterilization with activated carbon filter - Perfect for Bihar water conditions. Kills 99.99% of bacteria and viruses without chemicals.',
    price: 8999,
    originalPrice: 10999,
    category: 'uv',
    brand: 'Sai Flow Water',
    capacity: '10L',
    features: ['UV sterilization', 'Activated carbon', 'Pre-filter', 'Post-filter', 'LED indicators'],
    rating: 4.3,
    reviewCount: 89,
    inStock: true,
    stock: 8,
    images: ['/api/placeholder/400/300'],
    featured: true,
    specifications: {
      'Purification Technology': 'UV + Activated Carbon',
      'Storage Capacity': '10 Liters',
      'UV Lamp Life': '8000 hours',
      'Flow Rate': '2 L/min',
      'Operating Voltage': '230V AC',
      'Dimensions': '300 x 250 x 450 mm'
    }
  },
  {
    id: 3,
    name: 'Alkaline Water Purifier',
    description: 'Alkaline water with essential minerals retention - Premium choice for health-conscious families in Aurangabad.',
    price: 15999,
    originalPrice: 18999,
    category: 'alkaline',
    brand: 'Sai Flow Water',
    capacity: '8L',
    features: ['Alkaline water', 'Mineral retention', '8-stage purification', 'pH enhancement', 'Antioxidant boost'],
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    stock: 5,
    images: ['/api/placeholder/400/300'],
    featured: true,
    specifications: {
      'Purification Technology': 'RO + Alkaline + Minerals',
      'Storage Capacity': '8 Liters',
      'pH Level': '8.5 - 9.5',
      'TDS Range': '50-150 ppm',
      'Operating Voltage': '24V DC',
      'Dimensions': '380 x 340 x 520 mm'
    }
  },
  {
    id: 4,
    name: 'Gravity Water Filter 20L',
    description: 'Non-electric gravity-based water filter perfect for areas with power issues. Ideal for rural Aurangabad.',
    price: 4999,
    originalPrice: 6999,
    category: 'gravity',
    brand: 'Sai Flow Water',
    capacity: '20L',
    features: ['No electricity required', 'Ceramic candles', 'Activated carbon', 'Large capacity', 'Durable build'],
    rating: 4.2,
    reviewCount: 67,
    inStock: true,
    stock: 12,
    images: ['/api/placeholder/400/300'],
    featured: false,
    specifications: {
      'Purification Technology': 'Gravity + Ceramic + Carbon',
      'Storage Capacity': '20 Liters',
      'Filtration Rate': '1-2 L/hr',
      'Filter Life': '6-8 months',
      'Material': 'Food grade plastic',
      'Dimensions': '350 x 350 x 600 mm'
    }
  },
  {
    id: 5,
    name: 'Under Sink RO System',
    description: 'Compact under-sink RO system that saves counter space while providing pure water.',
    price: 18999,
    originalPrice: 22999,
    category: 'ro',
    brand: 'Sai Flow Water',
    capacity: '12L/hr',
    features: ['Space saving', '6-stage RO', 'Quick change filters', 'Leak detection', 'Smart faucet'],
    rating: 4.6,
    reviewCount: 94,
    inStock: true,
    stock: 7,
    images: ['/api/placeholder/400/300'],
    featured: false,
    specifications: {
      'Purification Technology': '6-stage RO',
      'Production Rate': '12 L/hr',
      'Recovery Rate': '30%',
      'Operating Pressure': '15-60 PSI',
      'Operating Voltage': '24V DC',
      'Dimensions': '400 x 150 x 350 mm'
    }
  },
  {
    id: 6,
    name: 'Countertop Water Purifier',
    description: 'Portable countertop purifier perfect for small families and offices.',
    price: 6999,
    originalPrice: 8999,
    category: 'countertop',
    brand: 'Sai Flow Water',
    capacity: '5L',
    features: ['Portable design', 'Multi-stage filtration', 'Easy maintenance', 'Compact size', 'LED display'],
    rating: 4.1,
    reviewCount: 45,
    inStock: true,
    stock: 20,
    images: ['/api/placeholder/400/300'],
    featured: false,
    specifications: {
      'Purification Technology': 'Multi-stage filtration',
      'Storage Capacity': '5 Liters',
      'Filtration Rate': '1 L/min',
      'Filter Life': '6 months',
      'Operating Voltage': '12V DC',
      'Dimensions': '250 x 200 x 350 mm'
    }
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockProductsAPI = {
  getProducts: async (params = {}) => {
    await delay(800);
    
    let filteredProducts = [...MOCK_PRODUCTS];
    
    // Apply filters
    if (params.category && params.category !== '') {
      filteredProducts = filteredProducts.filter(p => p.category === params.category);
    }
    
    if (params.search && params.search !== '') {
      const searchTerm = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm)
      );
    }
    
    if (params.minPrice && params.minPrice !== '') {
      filteredProducts = filteredProducts.filter(p => p.price >= parseInt(params.minPrice));
    }
    
    if (params.maxPrice && params.maxPrice !== '') {
      filteredProducts = filteredProducts.filter(p => p.price <= parseInt(params.maxPrice));
    }
    
    if (params.rating && params.rating !== '') {
      filteredProducts = filteredProducts.filter(p => p.rating >= parseFloat(params.rating));
    }
    
    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price-low':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-high':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'name':
        default:
          filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }
    
    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      data: {
        success: true,
        data: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          pages: Math.ceil(filteredProducts.length / limit)
        }
      }
    };
  },

  getProductById: async (id) => {
    await delay(500);
    
    const product = MOCK_PRODUCTS.find(p => p.id === parseInt(id));
    
    if (product) {
      return {
        data: {
          success: true,
          data: product
        }
      };
    } else {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Product not found'
          }
        }
      };
    }
  },

  getFeaturedProducts: async () => {
    await delay(600);
    
    const featuredProducts = MOCK_PRODUCTS.filter(p => p.featured);
    
    return {
      data: {
        success: true,
        data: featuredProducts
      }
    };
  },

  getProductsByCategory: async (category) => {
    await delay(700);
    
    const categoryProducts = MOCK_PRODUCTS.filter(p => p.category === category);
    
    return {
      data: {
        success: true,
        data: categoryProducts
      }
    };
  },

  addReview: async (productId, review) => {
    await delay(1000);
    
    // Mock adding review
    return {
      data: {
        success: true,
        message: 'Review added successfully'
      }
    };
  },

  createProduct: async (productData) => {
    await delay(1200);
    
    const newProduct = {
      id: MOCK_PRODUCTS.length + 1,
      ...productData,
      rating: 0,
      reviewCount: 0,
      inStock: true
    };
    
    MOCK_PRODUCTS.push(newProduct);
    
    return {
      data: {
        success: true,
        data: newProduct
      }
    };
  },

  updateProduct: async (id, productData) => {
    await delay(1000);
    
    const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === parseInt(id));
    
    if (productIndex !== -1) {
      MOCK_PRODUCTS[productIndex] = { ...MOCK_PRODUCTS[productIndex], ...productData };
      
      return {
        data: {
          success: true,
          data: MOCK_PRODUCTS[productIndex]
        }
      };
    } else {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Product not found'
          }
        }
      };
    }
  },

  deleteProduct: async (id) => {
    await delay(800);
    
    const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === parseInt(id));
    
    if (productIndex !== -1) {
      MOCK_PRODUCTS.splice(productIndex, 1);
      
      return {
        data: {
          success: true,
          message: 'Product deleted successfully'
        }
      };
    } else {
      throw {
        response: {
          status: 404,
          data: {
            message: 'Product not found'
          }
        }
      };
    }
  }
};
