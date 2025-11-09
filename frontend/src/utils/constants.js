export const CATEGORIES = [
  { value: 'countertop', label: 'Countertop Filters', icon: '🏠' },
  { value: 'under-sink', label: 'Under Sink Filters', icon: '💧' },
  { value: 'whole-house', label: 'Whole House Systems', icon: '🏡' },
  { value: 'reverse-osmosis', label: 'Reverse Osmosis', icon: '🔬' },
  { value: 'faucet-mount', label: 'Faucet Mount', icon: '🚰' },
  { value: 'portable', label: 'Portable Filters', icon: '🎒' },
  { value: 'commercial', label: 'Commercial Systems', icon: '🏢' }
];

export const SERVICE_TYPES = [
  { value: 'installation', label: 'Installation', icon: '🔧' },
  { value: 'repair', label: 'Repair Service', icon: '🛠️' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔍' },
  { value: 'filter-replacement', label: 'Filter Replacement', icon: '🔄' },
  { value: 'inspection', label: 'Inspection', icon: '📋' }
];

export const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)' },
  { value: 'afternoon', label: 'Afternoon (1:00 PM - 5:00 PM)' },
  { value: 'evening', label: 'Evening (6:00 PM - 9:00 PM)' }
];

export const ORDER_STATUS = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  processing: { label: 'Processing', color: '#8b5cf6' },
  shipped: { label: 'Shipped', color: '#06b6d4' },
  delivered: { label: 'Delivered', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#6b7280' }
};

export const BOOKING_STATUS = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  assigned: { label: 'Assigned', color: '#8b5cf6' },
  'in-progress': { label: 'In Progress', color: '#06b6d4' },
  completed: { label: 'Completed', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  rescheduled: { label: 'Rescheduled', color: '#f97316' }
};

export const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'debit_card', name: 'Debit Card', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '🔵' },
  { id: 'stripe', name: 'Stripe', icon: '💸' }
];

export const STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export const FEATURES = [
  'Multi-stage filtration',
  'RO technology',
  'UV purification',
  'Alkaline water',
  'Smart monitoring',
  'Easy installation',
  'Low maintenance',
  'Energy efficient',
  'Compact design',
  'Digital display'
];