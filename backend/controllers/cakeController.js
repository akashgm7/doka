const asyncHandler = require('express-async-handler');
const Cake = require('../models/Cake');

// @desc    Fetch all cakes
// @route   GET /api/cakes
// @access  Public
const getCakes = asyncHandler(async (req, res) => {
    const pageSize = 12;
    const page = Number(req.query.pageNumber) || 1;
    const eggless = req.query.eggless;
    let filter = {};
    if (eggless !== undefined) {
        filter.isEggless = eggless === 'true';
    }

    const count = await Cake.countDocuments(filter);
    const cakes = await Cake.find(filter)
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ cakes, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single cake
// @route   GET /api/cakes/:id
// @access  Public
const getCakeById = asyncHandler(async (req, res) => {
    const cake = await Cake.findById(req.params.id);

    if (cake) {
        res.json(cake);
    } else {
        res.status(404);
        throw new Error('Cake not found');
    }
});

// @desc    Create a cake
// @route   POST /api/cakes
// @access  Private/Admin
const createCake = asyncHandler(async (req, res) => {
    const cake = new Cake({
        name: 'Sample Cake',
        price: 0,
        user: req.user._id,
        image: '/images/sample.jpg',
        brand: 'DOKA',
        category: 'Signature',
        countInStock: 0,
        numReviews: 0,
        description: 'Sample description',
    });

    const createdCake = await cake.save();
    res.status(201).json(createdCake);
});

// @desc    Update a cake
// @route   PUT /api/cakes/:id
// @access  Private/Admin
const updateCake = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock,
    } = req.body;

    const cake = await Cake.findById(req.params.id);

    if (cake) {
        cake.name = name;
        cake.price = price;
        cake.description = description;
        cake.image = image;
        cake.brand = brand;
        cake.category = category;
        cake.countInStock = countInStock;

        const updatedCake = await cake.save();
        res.json(updatedCake);
    } else {
        res.status(404);
        throw new Error('Cake not found');
    }
});

// @desc    Delete a cake
// @route   DELETE /api/cakes/:id
// @access  Private/Admin
const deleteCake = asyncHandler(async (req, res) => {
    const cake = await Cake.findById(req.params.id);

    if (cake) {
        await cake.deleteOne();
        res.json({ message: 'Cake removed' });
    } else {
        res.status(404);
        throw new Error('Cake not found');
    }
});

module.exports = {
    getCakes,
    getCakeById,
    createCake,
    updateCake,
    deleteCake,
};
