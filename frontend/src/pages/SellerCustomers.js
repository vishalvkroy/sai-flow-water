import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import SellerNavbar from '../components/Seller/SellerNavbar';
import { customersAPI } from '../utils/api';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#3b82f6'};
  }
  
  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    background: ${props => props.color || '#3b82f6'};
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
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
    grid-template-columns: 2fr 1fr 1fr auto auto;
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

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.primary ? '#3b82f6' : 'white'};
  color: ${props => props.primary ? 'white' : '#374151'};
  border: 1px solid ${props => props.primary ? '#3b82f6' : '#d1d5db'};
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? '#2563eb' : '#f9fafb'};
    transform: translateY(-1px);
  }
`;

const CustomersTable = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr auto;
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

const CustomerRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr auto;
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

const CustomerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.125rem;
  }
  
  .customer-details {
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

const ContactInfo = styled.div`
  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    color: #6b7280;
    
    &:last-child {
      margin-bottom: 0;
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
  
  &.new {
    background: #dbeafe;
    color: #1d4ed8;
  }
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #dbeafe;
  color: #1d4ed8;
  
  &:hover {
    background: #bfdbfe;
    transform: translateY(-1px);
  }
`;

const SellerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomers: 0,
    vipCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Fetch real-time customer data from database
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('Fetching customers from API...');
      
      const response = await customersAPI.getAllCustomers();
      
      if (response.data.success) {
        const { customers: customersData, stats: statsData } = response.data.data;
        
        // Format customers for display
        const formattedCustomers = customersData.map(customer => ({
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || 'N/A',
          location: customer.address ? `${customer.address.city}, ${customer.address.state}` : 'N/A',
          totalOrders: customer.totalOrders,
          totalSpent: customer.totalSpent,
          status: customer.status.toLowerCase(),
          joinDate: new Date(customer.joinedDate).toISOString().split('T')[0],
          lastOrder: customer.lastOrderDate ? new Date(customer.lastOrderDate).toISOString().split('T')[0] : null
        }));
        
        console.log('Customers fetched:', formattedCustomers.length);
        console.log('Stats:', statsData);
        
        setCustomers(formattedCustomers);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'orders':
        return b.totalOrders - a.totalOrders;
      case 'spent':
        return b.totalSpent - a.totalSpent;
      case 'date':
        return new Date(b.joinDate) - new Date(a.joinDate);
      default:
        return 0;
    }
  });

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <PageContainer>
        <SellerNavbar />
        <MainContent>
          <LoadingSpinner />
        </MainContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SellerNavbar />
      
      <MainContent>
        <PageHeader>
          <h1>Customer Management</h1>
          <ActionButton primary>
            <FiDownload />
            Export Customers
          </ActionButton>
        </PageHeader>

        <StatsGrid>
          <StatCard
            color="#3b82f6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiUsers />
              </div>
            </div>
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </StatCard>

          <StatCard
            color="#10b981"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiUsers />
              </div>
            </div>
            <div className="stat-value">{stats.activeCustomers}</div>
            <div className="stat-label">Active Customers</div>
          </StatCard>

          <StatCard
            color="#8b5cf6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiUsers />
              </div>
            </div>
            <div className="stat-value">{stats.vipCustomers}</div>
            <div className="stat-label">VIP Customers</div>
          </StatCard>

          <StatCard
            color="#f59e0b"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stat-header">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
            </div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </StatCard>
        </StatsGrid>

        <FiltersSection>
          <div className="filters-row">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Search Customers
              </label>
              <SearchInput>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchInput>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <FilterSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
              </FilterSelect>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Sort By
              </label>
              <FilterSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name</option>
                <option value="orders">Total Orders</option>
                <option value="spent">Total Spent</option>
                <option value="date">Join Date</option>
              </FilterSelect>
            </div>
            
            <ActionButton>
              <FiFilter />
              More Filters
            </ActionButton>
          </div>
        </FiltersSection>

        <CustomersTable>
          <TableHeader>
            <div>Customer</div>
            <div>Contact</div>
            <div>Orders</div>
            <div>Total Spent</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>
          
          {filteredCustomers.map((customer, index) => (
            <CustomerRow
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CustomerInfo>
                <div className="avatar">
                  {getInitials(customer.name)}
                </div>
                <div className="customer-details">
                  <h4>{customer.name}</h4>
                  <p>Joined {customer.joinDate}</p>
                </div>
              </CustomerInfo>
              
              <ContactInfo>
                <div className="contact-item">
                  <FiMail />
                  {customer.email}
                </div>
                <div className="contact-item">
                  <FiPhone />
                  {customer.phone}
                </div>
                <div className="contact-item">
                  <FiMapPin />
                  {customer.location}
                </div>
              </ContactInfo>
              
              <div style={{ fontWeight: '600' }}>
                {customer.totalOrders} orders
              </div>
              
              <div style={{ fontWeight: '600', color: '#10b981' }}>
                {formatCurrency(customer.totalSpent)}
              </div>
              
              <StatusBadge className={customer.status}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </StatusBadge>
              
              <ViewButton title="View Customer Details">
                <FiEye />
              </ViewButton>
            </CustomerRow>
          ))}
        </CustomersTable>
      </MainContent>
    </PageContainer>
  );
};

export default SellerCustomers;
