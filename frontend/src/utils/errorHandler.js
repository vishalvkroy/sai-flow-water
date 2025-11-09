import { toast } from 'react-toastify';

// Professional error handler for API requests
export const handleApiError = (error, customMessage = null) => {
  console.error('API Error:', error);
  
  let message = customMessage || 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        message = data?.message || 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'Authentication failed. Please login again.';
        // Redirect to login if needed
        if (window.location.pathname !== '/login' && window.location.pathname !== '/seller-login') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
        break;
      case 403:
        message = 'Access denied. You don\'t have permission for this action.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 422:
        message = data?.message || 'Validation error. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
      case 503:
        message = 'Service temporarily unavailable. Please try again later.';
        break;
      default:
        message = data?.message || `Server error (${status}). Please try again.`;
    }
  } else if (error.request) {
    // Network error
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      message = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'ECONNREFUSED') {
      message = 'Unable to connect to server. Please try again later.';
    } else {
      message = 'Connection failed. Please check your internet connection.';
    }
  } else {
    // Something else happened
    message = error.message || 'An unexpected error occurred';
  }
  
  // Show error toast
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
  
  return { message, status: error.response?.status };
};

// Success notification
export const showSuccess = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Info notification
export const showInfo = (message) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Warning notification
export const showWarning = (message) => {
  toast.warning(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Error notification (alias for handleApiError for simple cases)
export const showError = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};
