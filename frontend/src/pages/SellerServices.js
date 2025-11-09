import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiTool,
  FiClock,
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiX,
  FiEdit
} from 'react-icons/fi';
import SellerNavbar from '../components/Seller/SellerNavbar';
import CancelOrderModal from '../components/Modals/CancelOrderModal';
import { servicesAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components/Layout/LoadingSpinner';

const SellerServices = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await servicesAPI.getAllServiceBookings(params);
      setBookings(response.data.data || []);
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error('Failed to fetch service bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await servicesAPI.getServiceStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus, data = {}) => {
    try {
      await servicesAPI.updateServiceStatus(bookingId, {
        status: newStatus,
        ...data
      });
      toast.success('Status updated successfully');
      fetchBookings();
      fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
    setShowModal(false);
  };

  const confirmCancelBooking = async (reason) => {
    try {
      await servicesAPI.cancelServiceBooking(bookingToCancel._id, { reason });
      toast.success('Booking cancelled successfully');
      fetchBookings();
      fetchStats();
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      assigned: '#8b5cf6',
      in_progress: '#06b6d4',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock />;
      case 'completed':
        return <FiCheckCircle />;
      default:
        return <FiTool />;
    }
  };

  if (loading && !bookings.length) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SellerNavbar />
      <Container>
        <Header>
          <h1>Service Bookings</h1>
          <p>Manage customer service requests</p>
        </Header>

        {stats && (
          <StatsGrid>
            <StatCard color="#f59e0b">
              <StatValue>{stats.pendingBookings}</StatValue>
              <StatLabel>Pending</StatLabel>
            </StatCard>
            <StatCard color="#3b82f6">
              <StatValue>{stats.confirmedBookings}</StatValue>
              <StatLabel>Confirmed</StatLabel>
            </StatCard>
            <StatCard color="#06b6d4">
              <StatValue>{stats.inProgressBookings}</StatValue>
              <StatLabel>In Progress</StatLabel>
            </StatCard>
            <StatCard color="#10b981">
              <StatValue>{stats.completedBookings}</StatValue>
              <StatLabel>Completed</StatLabel>
            </StatCard>
          </StatsGrid>
        )}

        <FilterSection>
          <FilterButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </FilterButton>
          <FilterButton
            active={statusFilter === 'confirmed'}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed
          </FilterButton>
          <FilterButton
            active={statusFilter === 'in_progress'}
            onClick={() => setStatusFilter('in_progress')}
          >
            In Progress
          </FilterButton>
          <FilterButton
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </FilterButton>
          <FilterButton
            active={statusFilter === 'cancelled'}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </FilterButton>
        </FilterSection>

        <BookingsGrid>
          {bookings.length === 0 ? (
            <EmptyState>
              <FiTool size={60} />
              <h3>No service bookings found</h3>
              <p>Service bookings will appear here</p>
            </EmptyState>
          ) : (
            bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  setSelectedBooking(booking);
                  setShowModal(true);
                }}
              >
                <BookingHeader>
                  <BookingNumber>{booking.bookingNumber}</BookingNumber>
                  <StatusBadge color={getStatusColor(booking.status)}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                  </StatusBadge>
                </BookingHeader>

                <BookingInfo>
                  <InfoRow>
                    <FiUser />
                    <span>{booking.user?.name || booking.address?.fullName}</span>
                  </InfoRow>
                  <InfoRow>
                    <FiTool />
                    <span>{booking.serviceType?.replace(/_/g, ' ')}</span>
                  </InfoRow>
                  <InfoRow>
                    <FiCalendar />
                    <span>{new Date(booking.preferredDate).toLocaleDateString()}</span>
                  </InfoRow>
                  <InfoRow>
                    <FiPhone />
                    <span>{booking.address?.phone}</span>
                  </InfoRow>
                </BookingInfo>

                <ViewButton>View Details</ViewButton>
              </BookingCard>
            ))
          )}
        </BookingsGrid>

        {showModal && selectedBooking && (
          <Modal onClick={() => setShowModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <h2>Service Booking Details</h2>
                <CloseButton onClick={() => setShowModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <Section>
                  <SectionTitle>Booking Information</SectionTitle>
                  <DetailRow>
                    <DetailLabel>Booking Number:</DetailLabel>
                    <DetailValue>{selectedBooking.bookingNumber}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Service Type:</DetailLabel>
                    <DetailValue>{selectedBooking.serviceType?.replace(/_/g, ' ')}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Product Type:</DetailLabel>
                    <DetailValue>{selectedBooking.productType}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Preferred Date:</DetailLabel>
                    <DetailValue>{new Date(selectedBooking.preferredDate).toLocaleDateString()}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Time Slot:</DetailLabel>
                    <DetailValue>{selectedBooking.preferredTimeSlot}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Issue Description:</DetailLabel>
                    <DetailValue>{selectedBooking.issueDescription}</DetailValue>
                  </DetailRow>
                </Section>

                <Section>
                  <SectionTitle>Customer Information</SectionTitle>
                  <DetailRow>
                    <DetailLabel>Name:</DetailLabel>
                    <DetailValue>{selectedBooking.address?.fullName}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Phone:</DetailLabel>
                    <DetailValue>{selectedBooking.address?.phone}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Email:</DetailLabel>
                    <DetailValue>{selectedBooking.address?.email}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Address:</DetailLabel>
                    <DetailValue>
                      {selectedBooking.address?.address}, {selectedBooking.address?.city}, {selectedBooking.address?.state} - {selectedBooking.address?.postalCode}
                    </DetailValue>
                  </DetailRow>
                </Section>

                <Section>
                  <SectionTitle>Actions</SectionTitle>
                  <ActionButtons>
                    {selectedBooking.status === 'pending' && (
                      <>
                        <ActionButton
                          color="#10b981"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'confirmed', {
                            note: 'Service booking confirmed'
                          })}
                        >
                          Confirm Booking
                        </ActionButton>
                        <ActionButton
                          color="#ef4444"
                          onClick={() => handleCancelBooking(selectedBooking)}
                        >
                          Cancel Booking
                        </ActionButton>
                      </>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <>
                        <ActionButton
                          color="#06b6d4"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'in_progress', {
                            note: 'Technician assigned and service started'
                          })}
                        >
                          Start Service
                        </ActionButton>
                        <ActionButton
                          color="#ef4444"
                          onClick={() => handleCancelBooking(selectedBooking)}
                        >
                          Cancel Booking
                        </ActionButton>
                      </>
                    )}
                    {selectedBooking.status === 'in_progress' && (
                      <>
                        <ActionButton
                          color="#10b981"
                          onClick={() => handleUpdateStatus(selectedBooking._id, 'completed', {
                            note: 'Service completed successfully'
                          })}
                        >
                          Mark as Completed
                        </ActionButton>
                        <ActionButton
                          color="#ef4444"
                          onClick={() => handleCancelBooking(selectedBooking)}
                        >
                          Cancel Booking
                        </ActionButton>
                      </>
                    )}
                    {selectedBooking.status === 'cancelled' && (
                      <DetailRow>
                        <DetailLabel>Status:</DetailLabel>
                        <DetailValue style={{ color: '#ef4444', fontWeight: 'bold' }}>
                          This booking has been cancelled
                        </DetailValue>
                      </DetailRow>
                    )}
                  </ActionButtons>
                </Section>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setBookingToCancel(null);
          }}
          onConfirm={confirmCancelBooking}
          orderNumber={bookingToCancel?.bookingNumber}
          type="booking"
        />
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2.5rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  p {
    color: #64748b;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.color};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 0.95rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.active ? '#3b82f6' : '#e2e8f0'};
  background: ${props => props.active ? '#3b82f6' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
`;

const BookingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
`;

const BookingNumber = styled.div`
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => `${props.color}15`};
  color: ${props => props.color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;

  svg {
    font-size: 1rem;
  }
`;

const BookingInfo = styled.div`
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #475569;

  svg {
    color: #94a3b8;
    font-size: 1.1rem;
  }
`;

const ViewButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #94a3b8;

  svg {
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #64748b;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 2px solid #f1f5f9;

  h2 {
    font-size: 1.5rem;
    color: #1e293b;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  svg {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  flex: 0 0 150px;
  font-weight: 600;
  color: #64748b;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #1e293b;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  flex: 1;
  min-width: 150px;
  padding: 1rem 1.5rem;
  background: ${props => props.color};
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => `${props.color}40`};
  }
`;

export default SellerServices;
