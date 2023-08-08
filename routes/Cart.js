const express = require('express');
const { addToCart, fetchCartByUser, updateCart, deleteFromCart} = require('../controller/Cart');

const router = express.Router();
// auth is already added in base path
router.post('/', addToCart)
    .get('/', fetchCartByUser)
    .delete('/:id', deleteFromCart)
    .patch('/:id', updateCart)


exports.router = router;