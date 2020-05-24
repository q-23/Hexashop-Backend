const express = require('express');
require('./db/mongoose');

const categoryRouter = require('./routers/category');
const purchaseRouter = require('./routers/purchase');
const productRouter = require('./routers/product');
const imageRouter = require('./routers/image');
const orderRouter = require('./routers/order');
const userRouter = require('./routers/user');

const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// app.set('view engine', 'ejs');
// app.engine('html', require('ejs').renderFile);

// app.use(express.static(path.join(__dirname, './views')));

app.use(categoryRouter);
app.use(purchaseRouter);
app.use(productRouter);
app.use(imageRouter);
app.use(orderRouter);
app.use(userRouter);

module.exports = app;
