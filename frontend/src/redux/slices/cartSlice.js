import {createSlice, createAsyncThunk} from "@reduxjs/toolkit"
import axios from "axios"

// Helper function to load cart from localStorage
const loadCartFromStorage = () => {
    const storedCart = localStorage.getItem("cart")
    return storedCart ? JSON.parse(storedCart) : { products: [] }
}

//HElper function to save cart to local Storage
const saveCartToStorage = (cart) => {
    localStorage.setItem("cart", JSON.stringify(cart))
}


//Fetch a cart for a user or guest
export const fetchCart = createAsyncThunk("cart/fetchCart", async({userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            params: {userId, guestId}
        })
        return response.data
    } catch (error) {
        console.error(error)
        return rejectWithValue(error.response.data)
    }
})


//Add an item to the cart for a user or guest
export const addToCart = createAsyncThunk("cart/addToCart", async({productId, quantity, size, color, userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            productId, quantity, size, color, userId, guestId
        })
        return response.data
    } catch (error) {
        console.error(error)
        return rejectWithValue(error.response.data)
    }
})


//Update the quantity of an item in the cart
export const updateCartItemQuantity = createAsyncThunk("cart/updateCartItemQuantity", async({productId, quantity, size, color, userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            productId, quantity, size, color, userId, guestId
        })
        return response.data
    } catch (error) {
        console.error(error)
        return rejectWithValue(error.response.data)
    }
})


//Remove an item from the cart
export const removeFromCart = createAsyncThunk("cart/removeFromCart", async({productId, size, color, userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios({
            method: "DELETE",
            url: `${import.meta.env.VITE_BACKEND_URL}/api/cart`,
            data: {productId, size, color, userId, guestId}
        })
        return response.data
    } catch (error) {
        console.error(error)
        return rejectWithValue(error.response.data)
    }
})


//Merge guestCart into userCart
export const mergeCart = createAsyncThunk("cart/mergeCart", async({userId, guestId}, {rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`, 
            {userId, guestId},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        )
        return response.data
    } catch (error) {
        console.error(error)
        return rejectWithValue(error.response.data)
    }
})


const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cart: loadCartFromStorage(),
        loading: false,
        error: null
    },
    reducers: {
        clearCart: (state) => {
            state.cart = {products: []}
            localStorage.removeItem("cart")
        }
    },
    extraReducers : (builder) => {
        builder
        //fetch cart
        .addCase(fetchCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload
            saveCartToStorage(action.payload)
        })
        .addCase(fetchCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message || "Failed to fetch Cart"
        })
        //add to cart
        .addCase(addToCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(addToCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload.cart ?? action.payload
            saveCartToStorage(action.payload.cart ?? action.payload)
        })
        .addCase(addToCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload.message || "Failed to Add to Cart"
        })
        //update the cart
        .addCase(updateCartItemQuantity.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload.cart ?? action.payload
            saveCartToStorage(action.payload.cart ?? action.payload)
        })
        .addCase(updateCartItemQuantity.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload.message || "Failed to update the  Cart"
        })
        //remove from cart
        .addCase(removeFromCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(removeFromCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload.cart ?? action.payload
            saveCartToStorage(action.payload.cart ?? action.payload)
        })
        .addCase(removeFromCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload.message || "Failed to remove item from the  Cart"
        })
        //Merge cart
        .addCase(mergeCart.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(mergeCart.fulfilled, (state, action) => {
            state.loading = false
            state.cart = action.payload.cart ?? action.payload
            saveCartToStorage(action.payload.cart ?? action.payload)
        })
        .addCase(mergeCart.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload.message || "Failed to merge  Cart"
        })
    }
})


export const {clearCart} = cartSlice.actions
export default cartSlice.reducer