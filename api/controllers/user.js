const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.user_signup = (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                /*409conflit*/
                return res.status(409).json({
                    message: 'Mail exists'
                });
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                    user
                        .save()
                        .then(result => {
                            res.status(200).json({
                                message: 'User created'
                            });
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({error:err})
                        });
                    }
                });
            }
        })


}

// exports.user_activate_2fa = (req, res, next) => {
//     User.find({email: req.body.email})
//         .exec()
//         .then(user => {
//             if (user.length < 1) {
//                 /*409conflit*/
//                 return res.status(409).json({
//                     message: 'L\'utilisateur n\'est pas enregistré'
//                 });
//             } else {
//                 Product.update({ _id: id }, { $set: req.body })
//                 .exec()
//                 .then(() => {
        
//                     const product = req.body
//                     io.getIO().emit('products', { action: 'update', product: product })
//                     res.status(200).json({
//                         message: 'Produit mis à jour correctement.'
//                     });
//                 })



//                 bcrypt.hash(req.body.password, 10, (err, hash) => {
//                     if(err) {
//                         return res.status(500).json({
//                             error: err
//                         });
//                     } else {
//                         const user = new User({
//                             _id: new mongoose.Types.ObjectId(),
//                             email: req.body.email,
//                             password: hash
//                         });
//                     user
//                         .save()
//                         .then(result => {
//                             res.status(200).json({
//                                 message: 'User created'
//                             });
//                         })
//                         .catch(err => {
//                             console.log(err);
//                             res.status(500).json({error:err})
//                         });
//                     }
//                 });
//             }
//         })


// }

exports.user_login = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'L\'email est incorrect.'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Le mot de passe est erroné.'
                    });
                }
                if (result === true) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id,
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "10h"
                        }
                    );
                    return res.status(200).json({
                        message: 'Connexion réussie',
                        token: token
                    });
                } else {
                    res.status(401).json({
                        message: 'Le mot de passe est erroné.'
                    });
                }
                
            })
        })
        .catch(err => {
            console.log(err);
            throw (err)
            // res.status(500).json({error:err})
        });
}

exports.user_delete = (req, res, next) => {
    User.deleteOne({_id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User deleted'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error:err})
        });
}
