const express = require('express');
require('./db/mongoose');

const productRouter = require('./routers/product');

const app = express();

app.use(express.json());
app.use(productRouter);

module.exports = app;
