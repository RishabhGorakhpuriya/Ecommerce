const express = require('express');
const { fetchBrand, createBrand } = require('../controller/Brand');
const router = express.Router();

router.get("/", fetchBrand).post('/', createBrand)

exports.router = router