const mongoose = require('mongoose');

const User = require('../models/user');
const Order = require ('../models/order');
const Product = require ('../models/product');

exports.orders_get_all = (req, res, next) => {
    Order.find()
        .select('_id user number date total products')
        .populate({ path: 'user', select: 'email' })
        .populate({ path: 'products', select: 'marque nom prix' })
        .exec()
        .then(docs => {
            res.status(200).json({
                all: docs.map(doc => {
                    return {
                        _id: doc._id,
                        user: doc.user,
                        number: doc.number,
                        date: doc.date,
                        total: doc.total,
                        products: doc.products
                    }
                }),

            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

exports.orders_create = async (req, res, next) => {
    try {
        // CHECK USER
        const user = await User.findById(req.body.user);

        if(!user) {
            return res.status(404).json({
                message: 'L\'utilisateur n\'existe pas.'
            });
        };

        // ORDER
        let newOrderNumber = Math.floor(10000 + Math.random() * 90000);

        let ordersNumber = await Order.find().select('number').exec();

        const isNumberExist = () => {
            let result = ordersNumber.filter(o => o.number === newOrderNumber);
            if (typeof result === 'array' && result.length > 0) {
                return true
            } else {
                return false
            }       
        };

        if (isNumberExist()) {
            return res.status(409).json({
                message: 'Le numéro de commande existe déjà.'
            });
        };

        // CHECK PRODUCTS
        req.body.products.forEach(async e => {
            let product = await Product.findById(e._id);
            if(!product) {
                return res.status(404).json({
                    message: 'Le produit' + e._id + 'n\'existe pas.'
                });
            };
        });

        // TOTAL
        var newOrderTotal = 0;

        req.body.products.forEach(e => {
            newOrderTotal += e.quantity * e.price;
        });   

        // create newOrder object
        const createOrder = new Order({
            _id: new mongoose.Types.ObjectId(),
            user: req.body.user,
            number: newOrderNumber,
            total: newOrderTotal,
            products: req.body.products
        });

        const newOrderSaved = await createOrder.save();

        res.status(201).json({
            message: 'Commande réalisée avec succès.',
            commande: newOrderSaved
        });
    } catch (error) {
        if(!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .populate('product')
        .exec()
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: 'La commande n\'a pas été trouvée.'
                })
            }
            res.status(200).json({
                order: order
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}

exports.orders_delete_order = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Commande supprimée.'
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
}
