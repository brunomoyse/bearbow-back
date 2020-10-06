const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    number: { type: Number, required: true},
    date: { type: Date, default: Date.now },
    total: { type: Number },
    products: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
            quantity: { type: Number },
            price: { type: Number }
        }
    ]
});

module.exports = mongoose.model('Order', orderSchema);
