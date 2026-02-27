const mongoose = require('mongoose');
const Order = require('../models/Order');

console.log('--- Inspecting Order Schema ---');
const productPath = Order.schema.path('orderItems.product');
console.log('Path type:', productPath.instance);
console.log('Options:', productPath.options);

if (productPath.instance === 'String') {
    console.log('SUCCESS: Product is a String.');
} else {
    console.log('FAILURE: Product is NOT a String. It is:', productPath.instance);
}
