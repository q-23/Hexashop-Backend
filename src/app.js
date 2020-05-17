const express = require('express');
require('./db/mongoose');

const productRouter = require('./routers/product');
const imageRouter = require('./routers/image');
const categoryRouter = require('./routers/category');

const app = express();

app.use(express.json());
app.use(categoryRouter);
app.use(productRouter);
app.use(imageRouter);

module.exports = app;
