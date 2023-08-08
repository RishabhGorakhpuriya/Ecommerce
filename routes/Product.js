const express = require('express');
const { createProduct, fatchAllProducts, fetchProductById, updateProduct } = require('../controller/Product');
const router = express.Router();


router.post("/", createProduct)
    .get('/', fatchAllProducts)
    .get('/:id', fetchProductById)
    .patch('/:id', updateProduct)
exports.router = router;