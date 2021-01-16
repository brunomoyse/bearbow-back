const mongoose = require('mongoose');
const io = require('../../socket');
const Product = require('../models/product');

exports.products_get_all = (req, res) => {
    Product.find()
        .select('_id categorie description disponibilite image marque nom prix type')
        .exec()
        .then(docs => {
            const response = {
                all: docs.map(doc => {
                    return {
                        _id: doc._id,
                        categorie: doc.categorie,
                        description: doc.description,
                        disponibilite: doc.disponibilite,
                        image: doc.image,
                        marque: doc.marque,
                        nom: doc.nom,
                        prix: doc.prix,
                        type: doc.type
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error:err})
        });
}

exports.products_create_product = (req, res) => {
    var newProduct = {
        _id: new mongoose.Types.ObjectId(),
        categorie:      req.body.categorie,
        description:    req.body.description,
        disponibilite:  req.body.disponibilite,
        marque:         req.body.marque,
        nom:            req.body.nom,
        prix:           req.body.prix,
        type:           req.body.type
    };


    if(req.files) {
        const paths = [];
        req.files.forEach(e => {
            paths.push(e.path)
        });
        var newProduct = { ...newProduct, image: paths };
    }

    let product = new Product(newProduct);

    product
        .save()
        .then(() => {
            io.getIO().emit('products', { action: 'create', product: product })
            res.status(201).json({
                message: 'Produit créé correctement.'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.products_get_product = (req, res) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('_id categorie description disponibilite image marque nom prix type')
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    product: doc
                });
            } else {
                res.status(404).json({message: 'No valid entry found for provided ID'});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error:err});
        });
}

exports.products_update_product = (req, res) => {

    const id = req.params.productId;

    const changeBool = (val) => {
        if (val === 'true' || val === true) {
            return true
        } else {
            return false
        }
    };

    let product = {...req.body,
        ...{
            prix: Number(req.body.prix),
            disponibilite: changeBool(req.body.disponibilite)
        }
    }

    if(req.files) {
        var paths = [];
        req.files.forEach(e => {
            paths.push(e.path)
        });

        var updatedProduct = {...product, ...{ image: paths }}

    } else {
        var updatedProduct = { ...product, ...{ image: req.body.image } };
    }


    Product.updateOne({ _id: id }, { $set: updatedProduct })
        .exec()
        .then(() => {
            io.getIO().emit('products', { action: 'update', product: updatedProduct })
            res.status(200).json({
                message: 'Produit mis à jour correctement.'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

};

exports.products_delete_product = (req, res) => {

    const id = req.params.productId // 'productId' vient du fichier route.js

    Product.findById(id)
        .select('image')
        .exec()
        .then(arrayImage => {
            switch (arrayImage.image.length) {
                case undefined | null:
                    console.log('Pas d\'image à supprimer')
                    break;
                default:
                    const fs = require("fs")
                    const length = arrayImage.image.length
                    for (let index = 0; index < length; index++) {
                        console.log()
                        fs.unlink(arrayImage.image[index], function(err) {
                            if (err) {
                                throw err
                            } else {
                                console.log('Image n°' + (index+1) + '/' + length + ' du produit supprimée')
                            }
                        })
                    }
                    break;
            }
        })
        .catch(err => {
            console.log(err);
        });

    Product.deleteOne({_id: id})
    .exec()
    .then(() => {
        io.getIO().emit('products', { action: 'delete', product: id })
        res.status(200).json({
            message: 'Produit supprimé correctement.'
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
}
