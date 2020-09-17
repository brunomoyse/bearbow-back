const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression')

const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

mongoose
    .connect(
        `mongodb+srv://dbTest:test123@restapi-node.wr2la.mongodb.net/restapi-node?retryWrites=true&w=majority`,
    {
    useNewUrlParser: true,
    useUnifiedTopology: true
    })
    .then(result => {
        // const server = app.listen(process.env.PORT || 3030);
        // const io = require('./socket').init(server);
        // io.on('connection', socket => {
        //     console.log('Client connected');
        // }) 
    })

// Pour les erreurs de dépréciations
mongoose.set('useCreateIndex', true);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(helmet());
app.use(compression());

// Prevent CORS errors dans le navigateur, pour que la navigateur puisse accéder à l'API
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({});
    }
    next();
});

// Routes which should handle requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

// Force HTTPS redirection
app.use(function(req, res, next) {
    if (
      req.secure ||
      req.headers["x-forwarded-proto"] === "https"
    ) {
      return next();
    } else {
      return res.redirect("https://" + req.headers.host + req.url);
    }
  });
 

module.exports = app;
