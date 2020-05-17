const express = require('express');
require('./db/mongoose');

const categoryRouter = require('./routers/category');
const productRouter = require('./routers/product');
const imageRouter = require('./routers/image');
const userRouter = require('./routers/user');

const app = express();

app.use(express.json());
app.use(categoryRouter);
app.use(productRouter);
app.use(imageRouter);
app.use(userRouter);

module.exports = app;
