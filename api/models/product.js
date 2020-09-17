const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categorie:      { type: String, required: true },
    description:    { type: String, required: false },
    disponibilite:  { type: Boolean, required: true},
    image:          { type: Array, required: false},
    marque:         { type: String, required: true },
    nom:            { type: String, required: true },
    prix:           { type: Number, required: false, default: null},
    date:           { type: Date, default: Date.now },
    type:           { type: String, required: true },
});

module.exports = mongoose.model('Product', productSchema);
