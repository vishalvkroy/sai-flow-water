import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../utils/api';
import { showError, showSuccess } from '../utils/errorHandler';

const CartContext = createContext();

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.items || [],
        totalItems: action.payload.totalItems || 0,
        totalPrice: action.payload.totalPrice || 0,
        loading: false,
        error: null
      };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'ADD_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        loading: false
      };
    
    case 'UPDATE_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        loading: false
      };
    
    case 'REMOVE_ITEM_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
        loading: false
      };
    
    case 'CLEAR_CART_SUCCESS':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        loading: false
      };
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const navigate = useNavigate();

  // Load cart on component mount
  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load cart from backend
  const loadCart = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_CART', payload: { items: [], totalItems: 0, totalPrice: 0 } });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: response.data.data });
    } catch (error) {
      console.error('Load cart error:', error);
      // If unauthorized, clear cart
      if (error.response?.status === 401) {
        dispatch({ type: 'SET_CART', payload: { items: [], totalItems: 0, totalPrice: 0 } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Please login to add items to cart');
        // Redirect to login page
        navigate('/login');
        throw new Error('Authentication required');
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.addToCart(productId, quantity);
      dispatch({ type: 'ADD_ITEM_SUCCESS', payload: response.data.data });
      showSuccess('Item added to cart successfully!');
      return response.data.data;
    } catch (error) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      throw error;
    }
  };

  // Update item quantity
  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.updateCartItem(productId, quantity);
      dispatch({ type: 'UPDATE_ITEM_SUCCESS', payload: response.data.data });
      
      if (quantity === 0) {
        showSuccess('Item removed from cart');
      } else {
        showSuccess('Cart updated successfully');
      }
      return response.data.data;
    } catch (error) {
      console.error('Update cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      throw error;
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    try {
      console.log('🗑️  Frontend: Removing item from cart');
      console.log('Product ID:', productId);
      console.log('Product ID type:', typeof productId);
      console.log('Current cart items:', state.items.length);
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.removeFromCart(productId);
      
      console.log('✅ Backend response received');
      console.log('Remaining items in response:', response.data.data.items.length);
      
      dispatch({ type: 'REMOVE_ITEM_SUCCESS', payload: response.data.data });
      showSuccess('Item removed from cart');
      return response.data.data;
    } catch (error) {
      console.error('❌ Remove from cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove item';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      throw error;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await cartAPI.clearCart();
      dispatch({ type: 'CLEAR_CART_SUCCESS' });
      showSuccess('Cart cleared successfully');
    } catch (error) {
      console.error('Clear cart error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      showError(errorMessage);
      throw error;
    }
  };

  // Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product._id === productId);
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get cart item quantity
  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Context value
  const value = {
    // State
    items: state.items,
    totalItems: state.totalItems,
    totalPrice: state.totalPrice,
    loading: state.loading,
    error: state.error,
    
    // Actions
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Helpers
    getCartItem,
    isInCart,
    getItemQuantity,
    clearError
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
