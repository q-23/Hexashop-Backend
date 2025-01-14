const express = require('express');
const cors = require('cors');

require('./db/mongoose');

const categoryRouter = require('./routers/category');
const purchaseRouter = require('./routers/purchase');
const productRouter = require('./routers/product');
const imageRouter = require('./routers/image');
const brandRouter = require('./routers/brand');
const userRouter = require('./routers/user');

const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(categoryRouter);
app.use(purchaseRouter);
app.use(productRouter);
app.use(brandRouter);
app.use(imageRouter);
app.use(userRouter);

module.exports = app;
