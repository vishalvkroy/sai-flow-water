import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Phone, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Filter,
  Search,
  User,
  Mail,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';
import SellerNavbar from '../components/Seller/SellerNavbar';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
`;

const MainContent = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  p {
    color: #6b7280;
    font-size: 1rem;
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
  border-left: 4px solid ${props => props.color || '#3b82f6'};
  
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
    background: ${props => props.color || '#3b82f6'}20;
    color: ${props => props.color || '#3b82f6'};
  }
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
  }
  
  .stat-label {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }
`;

const FiltersBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RequestsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const RequestCard = styled(motion.div)`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => 
    props.priority === 'urgent' ? '#ef4444' :
    props.priority === 'high' ? '#f59e0b' :
    props.priority === 'medium' ? '#3b82f6' : '#10b981'
  };
  
  &:hover {
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CustomerInfo = styled.div`
  flex: 1;
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.5rem;
  }
  
  .info-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.875rem;
    margin-bottom: 0.25rem;
  }
`;

const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => 
    props.priority === 'urgent' ? '#fee2e2' :
    props.priority === 'high' ? '#fef3c7' :
    props.priority === 'medium' ? '#dbeafe' : '#d1fae5'
  };
  color: ${props => 
    props.priority === 'urgent' ? '#991b1b' :
    props.priority === 'high' ? '#92400e' :
    props.priority === 'medium' ? '#1e40af' : '#065f46'
  };
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => 
    props.status === 'pending' ? '#fef3c7' :
    props.status === 'contacted' ? '#dbeafe' :
    props.status === 'completed' ? '#d1fae5' : '#fee2e2'
  };
  color: ${props => 
    props.status === 'pending' ? '#92400e' :
    props.status === 'contacted' ? '#1e40af' :
    props.status === 'completed' ? '#065f46' : '#991b1b'
  };
`;

const RequestDetails = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  
  .detail-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #6b7280;
      font-weight: 500;
    }
    
    .value {
      color: #1f2937;
      font-weight: 600;
    }
  }
  
  .message {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.5;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #fee2e2;
    color: #991b1b;
    
    &:hover {
      background: #fecaca;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CallRequests = () => {
  const [callRequests, setCallRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    todayRequests: 0,
    urgentRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    fetchCallRequests();
    fetchStats();
  }, [filters.status, filters.priority]);

  const fetchCallRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);

      const response = await axios.get(
        `http://localhost:5000/api/call-requests?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCallRequests(response.data.data.callRequests);
      }
    } catch (error) {
      console.error('Error fetching call requests:', error);
      toast.error('Failed to load call requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'http://localhost:5000/api/call-requests/stats',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/call-requests/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Request marked as ${status}`);
        fetchCallRequests();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request');
    }
  };

  const filteredRequests = callRequests.filter(request => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.customerName.toLowerCase().includes(searchLower) ||
        request.customerPhone.includes(searchLower) ||
        request.reason.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const formatTime = (date) => {
    const now = new Date();
    const requestDate = new Date(date);
    const diffMs = now - requestDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <Container>
      <SellerNavbar />
      <MainContent>
        <Header>
          <h1>
            <Phone size={32} />
            Call Requests
          </h1>
          <p>Manage customer call back requests efficiently</p>
        </Header>

        <StatsGrid>
          <StatCard color="#3b82f6">
            <div className="stat-header">
              <div className="stat-icon">
                <Phone />
              </div>
            </div>
            <div className="stat-value">{stats.totalRequests}</div>
            <div className="stat-label">Total Requests</div>
          </StatCard>

          <StatCard color="#f59e0b">
            <div className="stat-header">
              <div className="stat-icon">
                <Clock />
              </div>
            </div>
            <div className="stat-value">{stats.pendingRequests}</div>
            <div className="stat-label">Pending</div>
          </StatCard>

          <StatCard color="#10b981">
            <div className="stat-header">
              <div className="stat-icon">
                <CheckCircle />
              </div>
            </div>
            <div className="stat-value">{stats.todayRequests}</div>
            <div className="stat-label">Today</div>
          </StatCard>

          <StatCard color="#ef4444">
            <div className="stat-header">
              <div className="stat-icon">
                <AlertCircle />
              </div>
            </div>
            <div className="stat-value">{stats.urgentRequests}</div>
            <div className="stat-label">Urgent</div>
          </StatCard>
        </StatsGrid>

        <FiltersBar>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <SearchInput
              type="text"
              placeholder="Search by name, phone, or reason..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </FiltersBar>

        <RequestsGrid>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              Loading call requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              No call requests found
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                priority={request.priority}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <RequestHeader>
                  <CustomerInfo>
                    <h3>{request.customerName}</h3>
                    <div className="info-row">
                      <Phone size={14} />
                      {request.customerPhone}
                    </div>
                    {request.customerEmail && (
                      <div className="info-row">
                        <Mail size={14} />
                        {request.customerEmail}
                      </div>
                    )}
                  </CustomerInfo>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <PriorityBadge priority={request.priority}>
                      <AlertCircle size={12} />
                      {request.priority}
                    </PriorityBadge>
                    <StatusBadge status={request.status}>
                      {request.status}
                    </StatusBadge>
                  </div>
                </RequestHeader>

                <RequestDetails>
                  <div className="detail-row">
                    <span className="label">Reason:</span>
                    <span className="value">{request.reason}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Preferred Time:</span>
                    <span className="value">{request.preferredTime}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Requested:</span>
                    <span className="value">{formatTime(request.createdAt)}</span>
                  </div>
                  {request.message && (
                    <div className="message">
                      <MessageSquare size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                      {request.message}
                    </div>
                  )}
                </RequestDetails>

                <ActionButtons>
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => updateRequestStatus(request._id, 'contacted')}
                      >
                        <Phone size={16} />
                        Mark as Contacted
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => updateRequestStatus(request._id, 'completed')}
                      >
                        <CheckCircle size={16} />
                        Mark as Completed
                      </Button>
                    </>
                  )}
                  {request.status === 'contacted' && (
                    <Button
                      variant="primary"
                      onClick={() => updateRequestStatus(request._id, 'completed')}
                    >
                      <CheckCircle size={16} />
                      Mark as Completed
                    </Button>
                  )}
                  {request.status !== 'cancelled' && request.status !== 'completed' && (
                    <Button
                      variant="danger"
                      onClick={() => updateRequestStatus(request._id, 'cancelled')}
                    >
                      <XCircle size={16} />
                      Cancel
                    </Button>
                  )}
                </ActionButtons>
              </RequestCard>
            ))
          )}
        </RequestsGrid>
      </MainContent>
    </Container>
  );
};

export default CallRequests;
