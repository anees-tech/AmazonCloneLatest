import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext()

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItemIndex = state.items.findIndex(item => item._id === action.payload._id)
      
      if (existingItemIndex >= 0) {
        // If item exists, increase quantity
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        )
        return {
          ...state,
          items: updatedItems
        }
      } else {
        // If item doesn't exist, add new item
        return {
          ...state,
          items: [...state.items, { 
            ...action.payload, 
            quantity: action.payload.quantity || 1,
            // Ensure we have all necessary fields
            _id: action.payload._id || action.payload.id,
            name: action.payload.name,
            price: action.payload.price,
            image: action.payload.image || action.payload.images?.[0],
            category: action.payload.category
          }]
        }
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => (item._id || item.id) !== action.payload)
      }

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          (item._id || item.id) === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      }

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      }

    case 'LOAD_CART':
      return {
        ...state,
        items: Array.isArray(action.payload) ? action.payload : []
      }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }

    default:
      return state
  }
}

// Initial state
const initialState = {
  items: [],
  loading: false
}

// Cart Provider
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCartFromStorage = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        
        const savedCart = localStorage.getItem('amazonClone_cart')
        console.log('Loading cart from localStorage:', savedCart)
        
        if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
          const parsedCart = JSON.parse(savedCart)
          console.log('Parsed cart:', parsedCart)
          
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            dispatch({ type: 'LOAD_CART', payload: parsedCart })
            console.log('Cart loaded successfully:', parsedCart)
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        // Clear corrupted data
        localStorage.removeItem('amazonClone_cart')
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadCartFromStorage()
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!state.loading && state.items) {
      try {
        console.log('Saving cart to localStorage:', state.items)
        localStorage.setItem('amazonClone_cart', JSON.stringify(state.items))
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [state.items, state.loading])

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    console.log('Adding to cart:', product, 'Quantity:', quantity)
    
    if (!product || !product._id && !product.id) {
      console.error('Invalid product:', product)
      return
    }

    // Ensure product has required fields
    const productToAdd = {
      _id: product._id || product.id,
      name: product.name || 'Unknown Product',
      price: product.price || 0,
      image: product.image || product.images?.[0] || '/api/placeholder/300/300',
      category: product.category || { name: 'General' },
      originalPrice: product.originalPrice,
      quantity: Math.max(1, quantity)
    }

    console.log('Product being added:', productToAdd)

    dispatch({
      type: 'ADD_TO_CART',
      payload: productToAdd
    })
  }

  // Remove item from cart
  const removeFromCart = (productId) => {
    console.log('Removing from cart:', productId)
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    })
  }

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    console.log('Updating quantity:', productId, quantity)
    
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: productId, quantity: parseInt(quantity) }
      })
    }
  }

  // Clear entire cart
  const clearCart = () => {
    console.log('Clearing cart')
    dispatch({ type: 'CLEAR_CART' })
  }

  // Get total items count
  const getTotalItems = () => {
    const total = state.items.reduce((total, item) => total + (item.quantity || 0), 0)
    console.log('Total items:', total, 'Cart items:', state.items)
    return total
  }

  // Get total price
  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0)
  }

  // Check if item is in cart
  const isInCart = (productId) => {
    const inCart = state.items.some(item => (item._id || item.id) === productId)
    console.log('Is in cart:', productId, inCart)
    return inCart
  }

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => (item._id || item.id) === productId)
    return item ? item.quantity : 0
  }

  const value = {
    items: state.items,
    loading: state.loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  }

  console.log('Cart Context Value:', value)

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext