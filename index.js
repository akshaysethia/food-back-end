const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const dotenv = require('dotenv').config();
require('./config/passport');

const app = express();

const userRoutes = require('./routes/userRoutes');
const dishRoutes = require('./routes/dishRoutes');

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('An Error Occurred: ', err);
    }
    console.log('Connected To MongoDB !');
});

app.use('/user', userRoutes);
app.use('/dish', dishRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server Running at Port : http://localhost:${process.env.PORT}`);
});