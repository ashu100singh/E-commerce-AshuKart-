const express = require('express')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const { protect } = require('../middleware/authMiddleware')


const router = express.Router()

//Helper function to get a cart by userId or guestId
const getCart = async(userId, guestId) => {
    if(userId){
        return await Cart.findOne({user: userId})
    } else if(guestId){
        return await Cart.findOne({guestId})
    }
    return null
}


//@route POST /api/cart
//@desc Add a product to the cart for a guest or a loggedin user
//@access PUBLIC
router.post('/', async(req,res) => {
    const {productId, quantity, size, color, guestId, userId} = req.body
    try {
        const product = await Product.findById(productId)
        if(!product){
            res.status(404).json({message: "Prodcut not found"})
        }

        //Dtermine if the user is logged in or guest
        let cart = await getCart(userId, guestId)

        //if the cart exists update it
        if(cart){
            const productIndex = cart.products.findIndex(
                (p) => 
                    p.productId.toString() === productId &&
                    p.size === size &&
                    p.color === color
            )

            if(productIndex > -1){
                //if the product already exists, update the quantity
                cart.products[productIndex].quantity += quantity
            } else{
                //Add new product
                cart.products.push({
                    productId,
                    name: product.name,
                    image: product.images[0].url,
                    price: product.price,
                    size,
                    color,
                    quantity
                })
            }

            //Recalculate the total Price
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0)

            await cart.save()

            return res.status(200).json({
                cart,
                message: "Item added to Cart "
            })
        } else{
            // Create a new cart for the guest or user
            const newCart = await Cart.create({
                user: userId ? userId : undefined,
                guestId: guestId ? guestId : "guest_" + new Date().getTime(),
                products: [
                    {
                        productId,
                        name: product.name,
                        image: product.images[0].url,
                        price: product.price,
                        size,
                        color,
                        quantity
                    }
                ],
                totalPrice: product.price * quantity,
            })

            return res.status(201).json(newCart)
        }

    } catch (error) {
        console.error(error)
        res.status(500).send("Server Error")
    }
})


//@route PUT /api/cart
//@desc Update quantity of a product in the cart for a guest or a loggedIn user
//@access PUBLIC
router.put('/', async(req, res) => {
    const {productId, quantity, size, color, guestId, userId} = req.body
    try {
        let cart = await getCart(userId, guestId)
        if(!cart){
            return res.status(404).json({
                message: "Cart not found"
            })
        }

        const productIndex = cart.products.findIndex(
            (p) => 
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        )
        if(productIndex > -1){
            //update quantity
            if(quantity > 0){
                cart.products[productIndex].quantity = quantity
            } else{
                cart.products.splice(productIndex, 1) //-> remove product if quantity is 0
            }
            
            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity, 0
            )
            await cart.save()
            return res.status(200).json(cart)
        } else{
            return res.status(404).json({message: "Product not found in cart"})
        }

    } catch (error) {
        console.error(error)
        res.status(500).send("Server Error")
    }
})

module.exports = router