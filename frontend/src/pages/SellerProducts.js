import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiEdit, 
  FiEye, 
  FiSearch,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import axios from 'axios';
import io from 'socket.io-client';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
`;

const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
  
  .filters-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 1rem;
    align-items: end;
  }
  
  @media (max-width: 1024px) {
    .filters-row {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
  
  .search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ProductsTable = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const ProductRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    background: white;
    
    &:hover {
      background: white;
    }
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .product-image {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
  }
  
  .product-details {
    h4 {
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }
    
    p {
      color: #6b7280;
      font-size: 0.875rem;
      margin: 0;
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  &.active {
    background: #d1fae5;
    color: #065f46;
  }
  
  &.inactive {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &.low-stock {
    background: #fef3c7;
    color: #92400e;
  }
  
  &.out-of-stock {
    background: #fecaca;
    color: #7f1d1d;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &.view {
      background: #dbeafe;
      color: #1d4ed8;
      
      &:hover {
        background: #bfdbfe;
      }
    }
    
    &.edit {
      background: #fef3c7;
      color: #d97706;
      
      &:hover {
        background: #fde68a;
      }
    }
    
    &.delete {
      background: #fee2e2;
      color: #dc2626;
      
      &:hover {
        background: #fecaca;
      }
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  p {
    margin-bottom: 2rem;
  }
`;

const SellerProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  
  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = API_URL.replace('/api', '');

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/seller/login');
        return;
      }

      const params = new URLSearchParams({
        page,
        limit: 100, // Get all products for now
        showAll: 'true', // Show both active and inactive products
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter })
      });

      console.log('Fetching products with params:', params.toString());

      const response = await axios.get(`${API_URL}/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Products received:', response.data.data?.length);

      if (response.data.success) {
        let productsData = response.data.data || [];
        console.log('All products:', productsData.length, 'Active:', productsData.filter(p => p.isActive).length, 'Inactive:', productsData.filter(p => !p.isActive).length);
        
        // Calculate stats from ALL products first
        const allStats = {
          total: productsData.length,
          active: productsData.filter(p => p.isActive).length,
          inactive: productsData.filter(p => !p.isActive).length,
          lowStock: productsData.filter(p => p.stock < 10 && p.isActive).length,
          outOfStock: productsData.filter(p => p.stock === 0).length
        };
        
        setStats(allStats);
        
        // Then filter for display
        console.log('Current status filter:', statusFilter);
        if (statusFilter === 'all') {
          // Show all products (no filter)
          console.log('Showing all products:', productsData.length);
        } else if (statusFilter === 'active') {
          productsData = productsData.filter(p => p.isActive === true);
          console.log('Showing active products:', productsData.length);
        } else if (statusFilter === 'inactive') {
          productsData = productsData.filter(p => p.isActive === false);
          console.log('Showing inactive products:', productsData.length);
        } else if (statusFilter === 'low-stock') {
          productsData = productsData.filter(p => p.stock < 10 && p.isActive);
          console.log('Showing low stock products:', productsData.length);
        } else if (statusFilter === 'out-of-stock') {
          productsData = productsData.filter(p => p.stock === 0);
          console.log('Showing out of stock products:', productsData.length);
        } else {
          // Default: show only active products
          productsData = productsData.filter(p => p.isActive === true);
          console.log('Showing default (active) products:', productsData.length);
        }
        
        setProducts(productsData);
        setTotalPages(Math.ceil(productsData.length / 10));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/seller/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, categoryFilter, statusFilter]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connect', () => {
      // console.log('🔌 Connected to real-time server');
      setIsConnected(true);
      
      // Join seller room for personalized updates
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      socketRef.current.emit('join_seller', userId);
    });

    socketRef.current.on('disconnect', () => {
      // console.log('🔌 Disconnected from real-time server');
      setIsConnected(false);
    });

    // Listen for product updates
    socketRef.current.on('product_update', (data) => {
      // console.log('📦 Product update received:', data);
      fetchProducts(); // Refresh products list
    });

    // Listen for stats updates
    socketRef.current.on('stats_update', (newStats) => {
      // console.log('📊 Stats update received:', newStats);
      setStats(prevStats => ({
        ...prevStats,
        ...newStats
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('🗑️ Product deleted successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('❌ Failed to delete product. Please try again.', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    console.log('🔄 Toggle Active called - Product ID:', productId, 'Current Status:', currentStatus, 'Will set to:', !currentStatus);
    try {
      const token = localStorage.getItem('token');
      const updateData = { isActive: !currentStatus };
      console.log('📤 Sending PUT request to:', `${API_URL}/products/${productId}`, 'Data:', updateData);
      
      const response = await axios.put(`${API_URL}/products/${productId}`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      console.log('📥 Response from server:', response.data);
      if (!currentStatus) {
        // Activating
        toast.success('✅ Product activated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      } else {
        // Deactivating
        toast.warning('⏸️ Product deactivated! Select "Inactive Only" filter to see it.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('❌ Failed to update product status. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock.toString());
    setShowStockModal(true);
  };

  const handleStockSubmit = async () => {
    if (!newStockValue || isNaN(newStockValue)) {
      toast.error('❌ Please enter a valid number', {
        position: 'top-right',
        autoClose: 2000
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/products/${selectedProduct._id}`, 
        { stock: parseInt(newStockValue) },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success(`📦 Stock updated to ${newStockValue} units successfully!`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      setShowStockModal(false);
      setSelectedProduct(null);
      setNewStockValue('');
      fetchProducts();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('❌ Failed to update stock. Please try again.', {
        position: 'top-right',
        autoClose: 3000
      });
    }
  };

  const handleSetOutOfStock = async (productId) => {
    if (window.confirm('Set this product as out of stock (stock = 0)?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/products/${productId}`, 
          { stock: 0 },
          { headers: { Authorization: `Bearer ${token}` }}
        );
        toast.warning('🚫 Product set to out of stock!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        fetchProducts();
      } catch (error) {
        console.error('Error updating stock:', error);
        toast.error('❌ Failed to set out of stock. Please try again.', {
          position: 'top-right',
          autoClose: 3000
        });
      }
    }
  };

  const getProductStatus = (product) => {
    if (!product.isActive) return 'inactive';
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock <= 5) return 'low-stock';
    return 'active';
  };

  const filteredProducts = products;

  return (
    <PageContainer>
      <SellerNavbar />
      
      <MainContent>
        <PageHeader>
          <div>
            <h1>Products Management</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isConnected ? '#10b981' : '#ef4444',
                animation: isConnected ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {isConnected ? 'Live Updates Active' : 'Connecting...'}
              </span>
            </div>
          </div>
          <HeaderActions>
            <SecondaryButton onClick={fetchProducts}>
              <FiRefreshCw />
              Refresh
            </SecondaryButton>
            <SecondaryButton>
              <FiDownload />
              Export
            </SecondaryButton>
            <ActionButton to="/seller/products/add">
              <FiPlus />
              Add Product
            </ActionButton>
          </HeaderActions>
        </PageHeader>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Products</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>{stats.total || 0}</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Active Products</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', margin: 0 }}>{stats.active || 0}</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Low Stock</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', margin: 0 }}>{stats.lowStock || 0}</p>
            </div>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Out of Stock</h3>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>{stats.outOfStock || 0}</p>
            </div>
          </div>
        )}

        <FiltersSection>
          <div className="filters-row">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Search Products
              </label>
              <SearchInput>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInput>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Category
              </label>
              <FilterSelect
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="countertop">Countertop</option>
                <option value="under-sink">Under Sink</option>
                <option value="whole-house">Whole House</option>
                <option value="faucet-mount">Faucet Mount</option>
                <option value="reverse-osmosis">Reverse Osmosis</option>
                <option value="portable">Portable</option>
                <option value="commercial">Commercial</option>
              </FilterSelect>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <FilterSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </FilterSelect>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <SecondaryButton onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setStatusFilter('');
              }}>
                Clear Filters
              </SecondaryButton>
            </div>
          </div>
        </FiltersSection>

        <ProductsTable>
          <TableHeader>
            <div>Product</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
              <FiRefreshCw style={{ fontSize: '3rem', animation: 'spin 1s linear infinite' }} />
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => {
              const status = getProductStatus(product);
              return (
                <ProductRow
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductInfo>
                    <div className="product-image">
                      {product.images && product.images[0] ? (
                        <img 
                          src={product.images[0].startsWith('http') ? product.images[0] : `${SOCKET_URL}${product.images[0]}`}
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 2rem;">💧</div>';
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: '2rem' }}>💧</div>
                      )}
                    </div>
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p>SKU: {product.sku}</p>
                    </div>
                  </ProductInfo>
                  
                  <div style={{ textTransform: 'capitalize' }}>{product.category.replace('-', ' ')}</div>
                  <div style={{ fontWeight: '600', color: '#059669' }}>₹{product.price.toLocaleString('en-IN')}</div>
                  <div>{product.stock} units</div>
                  
                  <StatusBadge className={status}>
                    {status === 'active' && 'Active'}
                    {status === 'inactive' && 'Inactive'}
                    {status === 'low-stock' && 'Low Stock'}
                    {status === 'out-of-stock' && 'Out of Stock'}
                  </StatusBadge>
                  
                  <ActionButtons>
                    <button className="view" title="View Product" onClick={() => navigate(`/products/${product._id}`)}>
                      <FiEye />
                    </button>
                    <button className="edit" title="Edit Product" onClick={() => navigate(`/seller/products/edit/${product._id}`)}>
                      <FiEdit />
                    </button>
                    <select 
                      onChange={(e) => {
                        const action = e.target.value;
                        if (action === 'toggle-active') handleToggleActive(product._id, product.isActive);
                        if (action === 'update-stock') handleUpdateStock(product);
                        if (action === 'out-of-stock') handleSetOutOfStock(product._id);
                        if (action === 'delete') handleDeleteProduct(product._id);
                        e.target.value = '';
                      }}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      <option value="">Actions ▼</option>
                      <option value="toggle-active">{product.isActive ? '⏸️ Deactivate' : '▶️ Activate'}</option>
                      <option value="update-stock">📦 Update Stock</option>
                      <option value="out-of-stock">🚫 Set Out of Stock</option>
                      <option value="delete">🗑️ Delete Product</option>
                    </select>
                  </ActionButtons>
                </ProductRow>
              );
            })
          ) : (
            <EmptyState>
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <ActionButton to="/seller/products/add">
                <FiPlus />
                Add Your First Product
              </ActionButton>
            </EmptyState>
          )}
        </ProductsTable>

        {/* Cool Stock Update Modal */}
        {showStockModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setShowStockModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1f2937' }}>
                📦 Update Stock
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {selectedProduct.name}
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Current Stock: {selectedProduct.stock} units
                </label>
                <input
                  type="number"
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(e.target.value)}
                  placeholder="Enter new stock quantity"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleStockSubmit();
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowStockModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockSubmit}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 8px -1px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  Update Stock
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default SellerProducts;
