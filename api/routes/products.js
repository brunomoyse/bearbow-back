const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const ProductsController = require('../controllers/products');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        // problème de nom de fichier car ":" dans la fonction iso-string + supprime les espaces du nom de l'img
        cb(null, new Date().toISOString().replace(/:|\./g,'') + '-' + file.originalname.replace(/\s/g,'-'));
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

// multer pour recevoir des FormData avec image, /!\ si pas d'image à envoyer mais FormData avec texte uniquement, set le middleware sur upload.none()
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 /* = 1MB*/ * 5 /* = 5MB*/
    },
    fileFilter: fileFilter
}); 

router.get('/', ProductsController.products_get_all);

// router.post('/', checkAuth, upload.single('image'), ProductsController.products_create_product);

router.post('/', checkAuth, upload.array('image', 6), ProductsController.products_create_product);

router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, upload.array('image', 6), ProductsController.products_update_product);

router.delete('/:productId', checkAuth, ProductsController.products_delete_product);


module.exports = router;
