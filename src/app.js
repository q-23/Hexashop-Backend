const express = require('express');
require('./db/mongoose');

const productRouter = require('./routers/product');
const imageRouter = require('./routers/image');

const app = express();

app.use(express.json());
app.use(productRouter);
app.use(imageRouter);

module.exports = app;
